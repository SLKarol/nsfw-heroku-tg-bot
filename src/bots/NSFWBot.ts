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
        handler: this.fridayCommand,
      },
      {
        command: "subscribe",
        handler: this.subscribeCommand,
      },
      {
        command: "unsubscribe",
        handler: this.unSubscribeCommand,
      },
      {
        command: "quit",
        handler: this.quitCommand,
      },
      {
        command: "help",
        handler: this.helpCommand,
      },
      {
        command: "channels",
        handler: this.listChannelsCommand,
      },
    ] as unknown as BotCommandHandler[];
    this.assignCommands(commands);
  }

  /**
   * Отправка изображений
   * ! private ??
   * @param {string|number} chatId ID Чата
   * @param {string} redditChannelName Название канала
   * @param {number} maxCount Количество запрашиваемых записей
   */
  sendPictures = async (
    chatId: string,
    redditChannelName: string,
    maxCount: number = 20
  ) => {
    // Отправка контента в телеграм
    await this.bot.sendMessage(
      chatId,
      `Канал *${redditChannelName}* сообщает ...`,
      {
        parse_mode: "Markdown",
      }
    );

    this.reddit
      .getNewRecords({ name: redditChannelName, limit: maxCount })
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
  };

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
      promises.push(
        bot
          .sendMediaGroup(chatId, group as any)
          .then(() => delay(700))
          .then(() => ({ success: true }))
          .catch((err) => {
            return { success: false, message: err };
          })
      );
    }
    return Promise.all(promises);
  };

  /**
   * Обработка команды бота /subscribe
   * @param {string|number} chatId ID канала
   */
  subscribeCommand = (chatId: string) => {
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
  };

  /**
   * Обработка команды бота /unsubscribe
   * @param {string|number} chatId ID канала
   */
  unSubscribeCommand = (chatId: string) => {
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
  };

  /**
   * Обработка команды бота /quit
   * @param {string|number} chatId ID канала
   */
  quitCommand = (chatId: string) => {
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
  };

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
    const statusOk = { success: true };
    if (!list.length) {
      return Promise.resolve(statusOk);
    }
    const { bot } = this;
    const promises = [];
    for (const group of list) {
      const isArray = Array.isArray(group);
      promises.push(
        bot
          .sendMediaGroup(chatId, group as any)
          .then(() => delay(700))
          .then(() => statusOk)
          .catch((err) => {
            return { success: false, message: err };
          })
      );
    }
    return Promise.all(promises);
  }

  /**
   * Обработка команды бота /help
   * @param {string|number} chatId ID канала
   */
  helpCommand = (chatId: string) => {
    const { bot } = this;
    let helpText = `Телеграм-бот, созданный для развлечения, а не для работы.\n\n*Доступные команды:*\n`;
    helpText += COMMANDS.reduce((acc, cmd) => {
      const { command, description } = cmd;
      acc += `*/${command}* ${description}\n`;
      return acc;
    }, "");
    return bot.sendMessage(chatId, helpText, {
      parse_mode: "Markdown",
    });
  };

  /**
   * Вывести список каналов
   * @param {string|number} chatId
   */
  listChannelsCommand = (chatId: string) => {
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
  };

  /**
   * Получить информацию о канале
   */
  async getChannelInfo(channelName: string) {
    let requestChannelInfo = { name: "", correct: false };
    // Проверка корректности названия канала
    if (channelName) {
      requestChannelInfo.name = channelName;
      requestChannelInfo.correct = await this.db.checkCorrectChannel(
        channelName
      );
    }
    return requestChannelInfo;
  }

  /**
   * Вывести список каналов и тип рассылки
   */
  fridayCommand = async (chatId: string) => {
    this.bot.sendMessage(chatId, "Получить список каналов...");
    const channels = await this.db.getListChannels();
    const inlineKeyboard = channels.reduce(
      (acc: InlineKeyboardButton[][], c) => {
        const icon = c.moderationRequired ? "🔞 " : "";
        const nameChannel = `${icon} ${c.name}`;
        acc.push([
          { text: `${nameChannel} : 🖼️`, callback_data: `${c.name}/picture` },
        ]);
        return acc;
      },
      [[{ text: `Случайный : 🖼️`, callback_data: "/picture" }]]
    );
    this.bot.sendMessage(chatId, "Выберите канал:", {
      reply_markup: {
        resize_keyboard: true,
        inline_keyboard: inlineKeyboard,
      },
    });
  };

  /**
   * Обработчик выбора "далоговых" кнопок
   */
  callbackQuery = async (callbackQuery: CallbackQuery) => {
    const msg = callbackQuery.message || { chat: { id: "" } };
    // Спрятать клавиатуру
    // await this.removeHisKeyboard(callbackQuery);
    await this.bot.answerCallbackQuery(callbackQuery.id);
    const { data = "" } = callbackQuery;
    let [channelName, typeFriday] = data.split("/");
    if (!typeFriday) return;
    // Если задан случайный канал,  получить случайный
    if (!channelName) {
      const channel = await this.db.getRandomChannel(true);
      channelName = channel.name;
    }
    if (typeFriday === "picture")
      return this.sendPictures(msg.chat.id.toString(), channelName);
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
