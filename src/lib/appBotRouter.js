const express = require("express");
require("dotenv").config();
const BASE_URL =
  process.env.APP_URL || "https://nfsw-telegram-bot.herokuapp.com:443";

/**
 * @typedef {import('../lib/telegramBot.js')} TelegramBot
 */

/**
 * Создание роутера для телеграмм-бота:
 * 1. Создаёт веб-хук для бота
 * 2. Содержит метод поиска подписчиков
 */
class AppBotRouter {
  /**
   * Создаёт для бота веб=хук и привязывает его к адресу.
   * @param {TelegramBot} bot Бот
   * @param {string} baseUrl URL апи, к которому привязать веб-хук
   */
  constructor(bot, baseUrl) {
    this.bot = bot;
    const urlWebHook = `${BASE_URL}${baseUrl}/webhook`;
    this.router = express.Router();
    this.router.post("/webhook", (req, res) => {
      bot.bot.processUpdate(req.body);
      res.sendStatus(200);
    });
    bot.bot.setWebHook(urlWebHook);
  }

  /**
   * Возвращает список ID чатов для рассылки
   */
  async getChatForMailing() {
    const ids = await this.bot.manageSubscribe.getChatIdsForMailing();
    const promiseArray = [];
    for (const chatId of ids) {
      promiseArray.push(
        this.#canSendMessage(chatId).catch(() => ({
          chatId: chatId,
          possibleSend: false,
        }))
      );
    }
    const promise = Promise.all(promiseArray);
    return promise
      .then((array) =>
        array.reduce((acc, item) => {
          if (item.possibleSend) {
            acc.push(item.chatId);
          }
          return acc;
        }, [])
      )
      .then((array) => Array.from(new Set(array)));
  }

  /**
   * Проверка того, что можно отправить сообщение
   * @param {string | number} chatId ID чата
   * @returns {Promise<Object>}
   */
  async #canSendMessage(chatId) {
    const { bot } = this.bot;
    try {
      const info = await bot.getChat(chatId);
      if (info.permissions) {
        const {
          permissions: { can_send_media_messages = false },
        } = info;
        return { chatId, possibleSend: can_send_media_messages };
      }
      // Если юзер, то он всегда может получать сообщения
      return chatId
        ? { chatId, possibleSend: true }
        : { chatId, possibleSend: false };
    } catch (e) {
      return false;
    }
  }
}
module.exports = AppBotRouter;
