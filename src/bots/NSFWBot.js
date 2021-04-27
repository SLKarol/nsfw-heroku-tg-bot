const delay = require("@stanislavkarol/delay");

const COMMANDS = require("../const/commands");

const TelegramBot = require("../lib/telegramBot");

/**
 * @typedef {import('../lib/reddit')} Reddit
 * @typedef {import('../lib/modelNsfw')} ModelNsfw
 */

/**
 * Телеграм-бот для nsfw
 */
class NSFWBot extends TelegramBot {
  /**
   * Телеграм-бот для reddit/nsfw
   * @param {string} token
   * @param {Reddit} reddit
   * @param {ModelNsfw} db - База данных
   */
  constructor(token, reddit, db) {
    super({
      token,
      commands: COMMANDS,
      mailingName: "friday",
    });
    this.db = db;
    this.reddit = reddit;
    this.#setHandleCommands();
  }

  /**
   * Назначить обработчики команд
   */
  #setHandleCommands() {
    const commands = [
      {
        command: "friday",
        handler: this.fridayCommand.bind(this),
      },
      {
        command: "subscribe",
        handler: this.subscribeCommand.bind(this),
      },
      {
        command: "unsubscribe",
        handler: this.unSubscribeCommand.bind(this),
      },
      {
        command: "quit",
        handler: this.quitCommand.bind(this),
      },
      {
        command: "video",
        handler: this.videoCommand.bind(this),
      },
      {
        command: "help",
        handler: this.helpCommand.bind(this),
      },
      {
        command: "channels",
        handler: this.listChannelsCommand.bind(this),
      },
    ];
    this.assignCommands(commands);
  }

  /**
   * Обработка команды бота /friday
   * @param {string|number} chatId ID Чата
   * @param {TelegramBot.ParsedCommandText} parsedMessage Команда боту
   */
  async fridayCommand(chatId, parsedMessage) {
    const requestChannelInfo = await this.getChannelInfo(parsedMessage);
    if (!requestChannelInfo.correct) {
      return this.bot.sendMessage(chatId, "Увы, введён незнакомый канал.");
    }
    const { name } = requestChannelInfo;
    // Получить параметр с количеством записей:
    const limit = this.#getMaxCountRecords(parsedMessage);
    this.bot
      .sendMessage(chatId, `Канал *${name}* сообщает ...`, {
        parse_mode: "Markdown",
      })
      .then(() => this.reddit.getNewRecords({ name, limit }))
      .then((records) => {
        if (!records.length) {
          return this.bot.sendMessage(
            chatId,
            "На канале не найдено материалов."
          );
        }
        const fridayMessages = this.createAlbums(
          records,
          this.reddit.mapRedditForTelegram
        );
        return this.sendFridayContent({ chatId, fridayMessages });
      })
      .then(() => this.bot.sendMessage(chatId, "На этом у меня всё."))
      .catch((err) => console.error(err));
  }

  /**
   * Рассылка пятничных фото
   * @param {Object} props
   * @param {string|number} props.chatId ID чата
   * @param {Array} props.fridayMessages Пятничный контент
   */
  sendFridayContent = ({ chatId, fridayMessages }) => {
    const { bot } = this;
    const promises = [];
    for (const group of fridayMessages) {
      let promise;
      if (group.length > 1) {
        promise = bot.sendMediaGroup(chatId, group);
      } else {
        // Если это всего лишь одно фото, то отправить одно фото
        const [photo] = group;
        promise = bot.sendPhoto(chatId, photo.media, {
          disable_notification: true,
          caption: photo.caption,
        });
      }
      promises.push(
        promise
          .then(() => delay(700))
          .catch((err) => console.log("sendFridayContent Error: ", err))
      );
    }
    return Promise.all(promises);
  };

  /**
   * Обработка команды бота /subscribe
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   */
  subscribeCommand(chatId) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Подписаться на рассылку...")
      .then(() => this.manageSubscribe.subscribe(chatId))
      .then(() => bot.sendMessage(chatId, "Задание принято."))
      .catch((e) => {
        console.error(e);
        bot.sendMessage(
          chatId,
          `Произошла ошибка:
${e}`
        );
      });
  }

  /**
   * Обработка команды бота /unsubscribe
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   */
  unSubscribeCommand(chatId) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Отписаться от рассылки...")
      .then(() => this.manageSubscribe.unsubscribe(chatId))
      .then(() => bot.sendMessage(chatId, "Рассылка не будет приходить."))
      .catch((e) => {
        console.error(e);
        bot.sendMessage(
          chatId,
          `Произошла ошибка:
${e}`
        );
      });
  }

  /**
   * Обработка команды бота /quit
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   */
  quitCommand(chatId) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Я ухожу...")
      .then(() => this.manageSubscribe.unsubscribe(chatId))
      .then(() => bot.leaveChat(chatId))
      .catch((e) => {
        console.error(e);
        bot.sendMessage(
          chatId,
          `Произошла ошибка:
${e}`
        );
      });
  }

  /**
   * Обработка команды бота /video
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   * @param {TelegramBot.ParsedCommandText} parsedMessage Команда боту
   */
  async videoCommand(chatId, parsedMessage) {
    const requestChannelInfo = await this.getChannelInfo(parsedMessage);
    if (!requestChannelInfo.correct) {
      return this.bot.sendMessage(chatId, "Увы, введён незнакомый канал.");
    }
    const { bot } = this;
    const { name } = requestChannelInfo;
    // Получить параметр с количеством записей:
    const limit = this.#getMaxCountRecords(parsedMessage, 10);

    bot
      .sendMessage(chatId, `Канал *${name}* сообщает ...`, {
        parse_mode: "Markdown",
      })
      .then(() =>
        this.reddit.getNewVideoRecords({
          name,
          limit,
        })
      )
      .then((list) => {
        // const listVideos=list.filter(i=>i!==null);
        if (!list.length) {
          return bot.sendMessage(chatId, "Новых видео не найдено.");
        }
        return this.sendFridayContentVideo({ chatId, list });
      })
      .catch((e) => {
        console.error(e);
        bot.sendMessage(
          chatId,
          `Произошла ошибка:
${e}`
        );
      });
  }

  /**
   * Отправка видеоконтента
   * @param {Object} props
   * @param {string|number} props.chatId ID чата
   * @param {Array} props.list Массив содержимого
   */
  async sendFridayContentVideo({ chatId, list }) {
    if (!list.length) {
      return process.nextTick();
    }
    const { bot } = this;
    return bot
      .sendMessage(chatId, `Нашлось видео: ${list.length} .`)
      .then(() => {
        const promises = [];
        list.forEach((record) => {
          promises.push(
            bot
              .sendVideo(chatId, record.url, {
                caption: record.title,
                disable_notification: true,
              })
              .then(() => delay())
              .catch((err) => console.error(err))
          );
        });
        return Promise.all(promises);
      });
  }

  /**
   * Обработка команды бота /help
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   */
  helpCommand(chatId) {
    const { bot } = this;
    let helpText = `Телеграм-бот, созданный для развлечения, а не для работы.\n*Доступные команды:*\n`;
    helpText += COMMANDS.map(
      (command) => `*/${command.command}* ${command.description}`
    ).join(`\n`);
    return bot.sendMessage(chatId, helpText, {
      parse_mode: "Markdown",
    });
  }

  /**
   * Вывести список каналов
   * @param {string|number} chatId
   */
  listChannelsCommand(chatId) {
    const { bot } = this;
    this.db
      .getListChannels()
      .then((channels) => {
        let message = channels.reduce((acc, record) => {
          acc += `${record.name} _(Видео: ${
            record.onlyVideo ? "Да" : "Нет"
          })_\n`;
          return acc;
        }, "");
        message +=
          "\nЕсли содержит видео, значит контент может быть тем, кому за 21";
        return bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      })
      .catch((err) => console.error(err));
  }

  /**
   * Получить имя канала
   * @param {TelegramBot.ParsedCommandText} parsedMessage Команда
   */
  async getChannelInfo(parsedMessage) {
    const { commandArgs = [] } = parsedMessage;
    let requestChannelInfo = { name: "", correct: false };
    // Проверка корректности названия канала
    if (commandArgs.length) {
      requestChannelInfo.name = commandArgs[0];
      requestChannelInfo.correct = await this.db.checkCorrectChannel(
        requestChannelInfo.name
      );
    } else {
      // Если названия нет, то нужно получить случайное
      const randomChannel = await this.db.getRandomChannel();
      requestChannelInfo.name = randomChannel.name;
      requestChannelInfo.correct = true;
    }
    return requestChannelInfo;
  }

  /**
   * Получить из команды максимальное количество записей
   * @param {TelegramBot.ParsedCommandText} parsedMessage Команда боту
   * @param {number} defaultMaxCount - По умолчанию
   * @returns {number} количество записей
   */
  #getMaxCountRecords(parsedMessage, defaultMaxCount = 20) {
    // Получить параметр с количеством записей:
    let limit = defaultMaxCount;
    if (parsedMessage.commandArgs.length === 2) {
      const paramLimit = parseInt(parsedMessage.commandArgs[1], 10);
      if (paramLimit !== NaN && paramLimit < 51 && paramLimit > 0) {
        limit = paramLimit;
      }
    }
    return limit;
  }
}
module.exports = NSFWBot;
