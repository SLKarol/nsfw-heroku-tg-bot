import { CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";
import delay from "@stanislavkarol/delay";

import { BotCommandHandler, ParsedCommandText } from "../types/telegramBot";
import { IRedditApiRerod, RedditMediaTelegram } from "../types/reddit";

import COMMANDS from "../const/commands";
import type Reddit from "../lib/reddit";
import type ModelNsfw from "../lib/modelNsfw";

import TelegramBot from "../lib/telegramBot";

/**
 * Телеграм-бот для nsfw
 */
class NSFWBot extends TelegramBot {
  db: ModelNsfw;
  reddit: Reddit;
  /**
   * Телеграм-бот для reddit/nsfw
   * @param {string} token
   * @param {Reddit} reddit
   * @param {ModelNsfw} db - База данных
   */
  constructor(token: string, reddit: Reddit, db: ModelNsfw) {
    super({
      token,
      commands: COMMANDS,
      mailingName: "friday",
    });
    this.db = db;
    this.reddit = reddit;
    this.setHandleCommands();
    this.bot.on("callback_query", this.callbackQuery);
  }

  /**
   * Назначить обработчики команд
   */
  private setHandleCommands() {
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
      {
        command: "test",
        handler: this.testCommand,
      },
    ] as BotCommandHandler[];
    this.assignCommands(commands);
  }

  /**
   * Обработка команды /friday
   * @param {string|number} chatId ID Чата
   * @param {ParsedCommandText} parsedMessage Команда боту
   */
  async fridayCommand(chatId: string, parsedMessage: ParsedCommandText) {
    const requestChannelInfo = await this.getChannelInfo(parsedMessage);
    if (!requestChannelInfo.correct) {
      return this.bot.sendMessage(chatId, "Увы, введён незнакомый канал.");
    }
    const { name } = requestChannelInfo;
    // Получить параметр с количеством записей:
    const limit = this.getMaxCountRecords(parsedMessage);
    // Отправка контента в телеграм
    await this.bot.sendMessage(chatId, `Канал *${name}* сообщает ...`, {
      parse_mode: "Markdown",
    });

    this.reddit
      .getNewRecords({ name, limit })
      .then((records) => {
        if (!records.length) {
          return this.bot.sendMessage(chatId, "На канале нет новостей.");
        }
        const fridayMessages = this.createAlbums(
          records as IRedditApiRerod[],
          this.reddit.mapRedditForTelegram
        );
        return this.sendFridayContent({ chatId, fridayMessages }) as any;
      })
      .then(() => this.bot.sendMessage(chatId, "На этом у меня всё."))
      .catch((err) => {
        console.error(err);
        this.bot.sendMessage(chatId, `В работе возникла ошибка:\n${err}`, {
          parse_mode: "Markdown",
        });
      });
  }

  /**
   * Рассылка пятничных фото
   * @param {Object} props
   * @param {string|number} props.chatId ID чата
   * @param {Array} props.fridayMessages Пятничный контент в виде альбомов
   */
  sendFridayContent = ({
    chatId,
    fridayMessages,
  }: {
    chatId: string;
    fridayMessages: RedditMediaTelegram[][];
  }) => {
    const { bot } = this;
    const promises = [];
    for (const group of fridayMessages) {
      let promise;
      if (group.length > 1) {
        promise = bot.sendMediaGroup(chatId, group as any);
      } else {
        // Если это всего лишь одно фото, то отправить одно фото
        const [photo] = group;
        promise = bot.sendPhoto(chatId, photo.media as string, {
          disable_notification: true,
          caption: photo.title,
        });
        // .catch((err) => err);
      }
      promises.push(
        promise
          .then(() => delay(700))
          .then(() => ({ status: "ok" }))
          .catch((err) => {
            console.error("sendFridayContent Error: ", err);
            return { status: "error", error: err };
          })
      );
    }
    return Promise.all(promises);
  };

  /**
   * Обработка команды бота /subscribe
   * @param {string|number} chatId ID канала
   */
  subscribeCommand(chatId: string) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Подписаться на рассылку...")
      .then(() => this.manageSubscribe?.subscribe(chatId))
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
   */
  unSubscribeCommand(chatId: string) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Отписаться от рассылки...")
      .then(() => this.manageSubscribe?.unsubscribe(chatId))
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
   */
  quitCommand(chatId: string) {
    const { bot } = this;
    bot
      .sendMessage(chatId, "Я ухожу...")
      .then(() => this.manageSubscribe?.unsubscribe(chatId))
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
   * todo: научить бот мерджить аудио и видеодорожки.
   * @param {string|number} chatId ID канала
   * @param {TelegramBot} bot Бот
   * @param {ParsedCommandText} parsedMessage Команда боту
   */
  async videoCommand(chatId: string, parsedMessage: ParsedCommandText) {
    const requestChannelInfo = await this.getChannelInfo(parsedMessage);
    if (!requestChannelInfo.correct) {
      return this.bot.sendMessage(chatId, "Увы, введён незнакомый канал.");
    }
    const { bot } = this;
    const { name } = requestChannelInfo;
    // Получить параметр с количеством записей:
    const limit = this.getMaxCountRecords(parsedMessage, 10);

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
        if (list === null || !list.length) {
          return bot.sendMessage(chatId, "Новых видео не найдено.");
        }
        const listAlbums = this.createAlbums(
          list,
          this.reddit.mapVideoRedditForTelegram
        );

        return this.sendFridayContentVideo({ chatId, list: listAlbums }) as any;
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
   * @param {Array} props.list Массив альбомов
   */
  async sendFridayContentVideo({
    chatId,
    list,
  }: {
    chatId: string;
    // list: RedditMediaTelegram[][] | RedditMediaTelegram[];
    list: (RedditMediaTelegram | RedditMediaTelegram[])[];
  }) {
    const statusOk = { status: "ok" };
    if (!list.length) {
      return Promise.resolve(statusOk);
    }
    const { bot } = this;
    const promises = [];
    for (const group of list) {
      const isArray = Array.isArray(group);
      let promise;
      if ((group as RedditMediaTelegram[]).length > 1 && isArray) {
        promise = bot.sendMediaGroup(chatId, group as any);
      } else {
        // Если это всего лишь одно видео, то отправить одно видео
        const video = (
          isArray ? (group as RedditMediaTelegram[])[0] : group
        ) as RedditMediaTelegram;
        const { title = "", media } = video;
        promise = bot.sendVideo(chatId, media as Buffer | string, {
          disable_notification: true,
          caption: title,
        });
      }
      promises.push(
        promise
          .then(() => delay(700))
          .then(() => statusOk)
          .catch((err) => {
            console.error("sendFridayContent Error: ", err);
            return { status: "error", error: err };
          })
      );
    }
    return Promise.all(promises);
  }

  /**
   * Обработка команды бота /help
   * @param {string|number} chatId ID канала
   */
  helpCommand(chatId: string) {
    const { bot } = this;
    let helpText = `Телеграм-бот, созданный для развлечения, а не для работы.\n\n*Доступные команды:*\n`;
    helpText += COMMANDS.reduce((acc, cmd) => {
      const { command, description, hideHelp = false } = cmd;
      if (!hideHelp) {
        acc += `*/${command}* ${description}\n`;
      }
      return acc;
    }, "");
    return bot.sendMessage(chatId, helpText, {
      parse_mode: "Markdown",
    });
  }

  /**
   * Вывести список каналов
   * @param {string|number} chatId
   */
  listChannelsCommand(chatId: string) {
    const { bot } = this;
    this.db
      .getListChannels()
      .then((channels) => {
        let message = channels.reduce((acc, record) => {
          acc += `${record.name} _(Видео: ${
            record.withVideo ? "Да" : "Нет"
          })_\n`;
          return acc;
        }, "");
        message += `\nЕсли содержит видео, то это значит, что:
1. Контент может быть с ограничением для тех, кому меньше 21 года,
2. Работа с таким каналом в разработке.`;
        return bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      })
      .catch((err) => console.error(err));
  }

  /**
   * Получить имя канала
   * @param {ParsedCommandText} parsedMessage Команда
   */
  async getChannelInfo(parsedMessage: ParsedCommandText) {
    const { commandArgs = [] } = parsedMessage;
    let requestChannelInfo = { name: "", correct: false };
    // Проверка корректности названия канала
    if (commandArgs.length && commandArgs[0]) {
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
   * @param {ParsedCommandText} parsedMessage Команда боту
   * @param {number} defaultMaxCount - По умолчанию
   * @returns {number} количество записей
   */
  private getMaxCountRecords(
    parsedMessage: ParsedCommandText,
    defaultMaxCount = 20
  ) {
    // Получить параметр с количеством записей:
    let limit = defaultMaxCount;
    if (parsedMessage.commandArgs?.length === 2) {
      const paramLimit = parseInt(parsedMessage.commandArgs[1], 10);
      if (paramLimit !== NaN && paramLimit < 51 && paramLimit > 0) {
        limit = paramLimit;
      }
    }
    return limit;
  }

  testCommand = async (chatId: string, parsedMessage: ParsedCommandText) => {
    this.bot.sendMessage(chatId, "Получить список каналов...");
    const channels = await this.db.getListChannels();
    const inlineKeyboard = channels.reduce(
      (acc: InlineKeyboardButton[][], c) => {
        const icon = c.moderationRequired ? "🔞 " : "";
        const nameChannel = `${icon} ${c.name}`;
        acc.push([
          { text: `${nameChannel} : 🖼️`, callback_data: `${c.name}/picture` },
          { text: `${nameChannel} : 📽️`, callback_data: `${c.name}/video` },
        ]);
        return acc;
      },
      [
        [
          { text: `Случайно : 🖼️`, callback_data: "/picture" },
          { text: `Случайно : 📽️`, callback_data: "/video" },
        ],
      ]
    );
    this.bot.sendMessage(chatId, "Выберите канал и тип контента:", {
      reply_markup: {
        resize_keyboard: true,
        inline_keyboard: inlineKeyboard,
      },
    });
  };

  callbackQuery = async (callbackQuery: CallbackQuery) => {
    const msg = callbackQuery.message || { chat: { id: 0 } };
    await this.removeHisKeyboard(callbackQuery);
    await this.bot.answerCallbackQuery(callbackQuery.id);
    return this.bot.sendMessage(msg.chat.id, "You clicked!");
  };

  /**
   * Удалить вывод клавиатуры
   */
  removeHisKeyboard = (callbackQuery: CallbackQuery) => {
    const messageText = callbackQuery.message?.text || "";
    const messageId = callbackQuery.message?.message_id || 0;
    return this.bot
      .editMessageText(messageText, {
        message_id: messageId,
        chat_id: callbackQuery.from.id,
        reply_markup: {
          inline_keyboard: [],
        },
      })
      .catch((err) => console.error(err));
  };
}

export default NSFWBot;
