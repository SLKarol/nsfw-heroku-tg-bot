const delay = require("@stanislavkarol/delay");
const asyncHandler = require("express-async-handler");

const AppBotRouter = require("../lib/appBotRouter");

/**
 * @typedef {import('../bots/NSFWBot.js')} NSFWBot
 *

/**
 * Создание апи-методов для работы с ботом.
 * Основан на AppBotRouter, так что веб-хук появится по умолчанию.
 */
class FridayRouter extends AppBotRouter {
  /**
   * Создаёт веб-хук и методы для работы с ботом
   * @param {NSFWBot} bot
   * @param {string} baseUrl URL апи, к которому привязать веб-хук
   */
  constructor(bot, baseUrl) {
    super(bot, baseUrl);
    this.router.post("/sendFriday", this.sendFriday);
    this.router.post("/sendFridayVideo", this.sendFridayVideo);
    this.router.post("/sendBOR", this.sendBOR);
    this.router.post("/getNSFW", this.getNSFW);
    this.router.post("/getVideoNSFW", this.getVideoNSFW);
    // ! удалить
    this.router.post("/testVideo", this.testVideo);
  }

  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFriday = asyncHandler(async (req, res) => {
    const { records = [], name = "nsfw" } = req.body;
    // Получить Название канала
    const infoChannel = await this.bot.getChannelInfo({ commandArgs: [name] });
    // Получить ID Чатов для рассылки
    const prChatIds = this.getChatForMailing();
    const prFridayMessages = !records.length
      ? this.bot.reddit.getNewRecords({ limit: 20, name: infoChannel.name })
      : new Promise((resolve) => resolve(records));
    return Promise.all([prChatIds, prFridayMessages])
      .then(([chatIds, records]) => {
        const fridayMessages = this.bot.createAlbums(
          records,
          this.bot.reddit.mapRedditForTelegram
        );
        // Защититься от повторного запроса
        const promises = chatIds.map((chatId) =>
          this.bot.sendFridayContent({ chatId, fridayMessages })
        );
        return Promise.all(promises);
      })
      .then(() => res.sendStatus(200));
  });

  /**
   * Отправить всем подписчикам пятничную видео-рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFridayVideo = asyncHandler(async (req, res) => {
    const { records = [], name = "nsfw", filterContent = true } = req.body;
    // Получить Название канала
    const infoChannel = await this.bot.getChannelInfo({ commandArgs: [name] });
    // Получить сообщения для рассылки
    const prFridayMessages = !records.length
      ? this.bot.reddit.getNewVideoRecords({
          limit: 10,
          name: infoChannel.name,
          filterContent,
        })
      : new Promise((resolve) => resolve(records));
    // Получить ID Чатов для рассылки
    const prChatIds = this.getChatForMailing();

    return Promise.all([prChatIds, prFridayMessages])
      .then(([chatIds, list]) => {
        // Защититься от повторного запроса
        const arrayIds = Array.from(new Set(chatIds));
        const promises = list.length
          ? arrayIds.map((chatId) =>
              this.bot.sendFridayContentVideo({ chatId, list })
            )
          : [];
        return Promise.all(promises);
      })
      .then(() => res.sendStatus(200));
  });

  sendBOR = (req, res) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    this.getChatForMailing()
      .then((chatIds) => {
        const articles = Array.from(req.body);
        const promises = chatIds.map((chatId) =>
          this.#sendBORContent({ chatId, articles })
        );
        return Promise.all(promises);
      })
      .then(() =>
        res.status(200).json({ message: "Отправлено", success: true })
      );
  };

  /**
   * Отправка БОР-контента через бот
   * @param {Object} props
   * @param {string|number} props.chatId ID чата
   * @param {Array} props.articles Массив сообщений
   */
  #sendBORContent = ({ chatId, articles }) => {
    const { bot } = this.bot;
    const promises = [];
    articles.forEach((article) => {
      promises.push(
        bot
          .sendMessage(
            chatId,
            `*${article.title}*
  ${article.content}`,
            { parse_mode: "Markdown" }
          )
          .then(() => delay())
          .catch((err) => console.error(err))
      );
      return Promise.all(promises);
    });
  };

  /**
   * Возвращает записи для модерирования рассылки
   * @param {Request} req
   * @param {Response} res
   */
  getNSFW = (req, res) => {
    const { limit = 20, name = "nsfw" } = req.body;
    // Определиться с количеством записей
    const count = +limit;
    this.bot.reddit
      .getNewRecords({
        limit: count === NaN ? 20 : count > 50 ? 50 : count,
        name,
      })
      .then((records) => {
        res.status(200).json({ records, name });
      });
  };

  /**
   * Возвращает видео-записи для модерирования рассылки
   * @param {Request} req
   * @param {Response} res
   */
  getVideoNSFW = (req, res) => {
    const { limit = 20, name = "nsfw" } = req.body;
    // Определиться с количеством записей
    const count = +limit;
    this.bot.reddit
      .getNewVideoRecords({
        limit: count === NaN ? 20 : count > 50 ? 50 : count,
        name,
      })
      .then((records) => {
        res.status(200).json({ records });
      });
  };

  testVideo = (req, res) => {
    const { video } = req.body;
    // const a = toArrayBuffer(video);
    // var buffer = Buffer.from(new Uint8Array(video));
    // console.log("a.length :>> ", a);
    // console.log("video :>> ", video);
    // const g = toArrayBuffer(video);
    // const buffer = Buffer.from(g);
    // console.log("g :>> ", g);
    // res.status(200).json({ message: "Отправлено", success: true });
    // const b64encoded = Buffer.from(video);
    const personUint8Array = Uint8Array.from(video);
    const buffer = Buffer.from(personUint8Array);
    console.log("b :>> ", buffer);
    this.bot.bot
      .sendVideo(570986591, buffer)
      .then((t) => {
        res.status(200);
      })
      .catch((e) => {
        res.status(401);
      });
  };
}
module.exports = FridayRouter;
