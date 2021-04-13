const COMMANDS = require("../const/commands");

const TelegramBot = require("../lib/telegramBot");
const delay = require("../lib/delay");

/**
 * @typedef {import('../lib/reddit')} Reddit
 */

/**
 * Телеграм-бот для nsfw
 */
class NSFWBot extends TelegramBot {
  /**
   * Телеграм-бот для reddit/nsfw
   * @param {string} token
   * @param {Reddit} reddit
   * @param {ManageSubscribe} manageSubscribe
   * @param {string} baseUrl
   */
  constructor(token, reddit, baseUrl) {
    super({
      token,
      commands: COMMANDS,
      mailingName: "friday",
    });
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
    ];
    this.assignCommands(commands);
  }

  /**
   * Обработка команды бота /friday
   * @param {string|number} chatId ID Чата
   */
  fridayCommand(chatId) {
    this.bot
      .sendMessage(chatId, "Прогони тоску и печаль со своего лица!")
      .then(() => this.reddit.getNewRecords())
      .then((records) => {
        const fridayMessages = this.reddit.getPartsMessage(records);
        return this.sendFridayContent({ chatId, fridayMessages });
      })
      .then(() => this.bot.sendMessage(chatId, "Надеюсь, Вам понравилось."))
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
   */
  videoCommand(chatId) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Поиск видео...")
      .then(() => this.reddit.getNewVideoRecords())
      .then((list) => {
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
}
module.exports = NSFWBot;
