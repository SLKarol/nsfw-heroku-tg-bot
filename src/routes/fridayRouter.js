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
    this.router.get("/listChannels", this.getListChannels);
    this.router.get("/getContent", this.getContent);
  }

  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFriday = asyncHandler(async (req, res) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
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
        // Защититься от повторного запроса
        const arrayIds = Array.from(new Set(chatIds));
        const fridayMessages = this.bot.createAlbums(
          records,
          this.bot.reddit.mapRedditForTelegram
        );
        const promises = arrayIds.map((chatId) =>
          this.bot.sendFridayContent({ chatId, fridayMessages })
        );
        return Promise.all(promises);
      })
      .then((resultWork) => this.analyzeModerateWork(resultWork, res))
      .catch((e) => res.status(400).json({ error: e }));
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
        // Отделить записи, где url в виде строки:
        // Потому что это gifv
        const gifVideos = list
          .filter((item) => typeof item.url === "string")
          .map(this.bot.reddit.mapVideoRedditForTelegram);
        // Обычные видео-альбомы для телеграм.
        const listAlbums = this.bot.createAlbums(
          list.filter((item) => typeof item.url !== "string"),
          this.bot.reddit.mapVideoRedditForTelegram
        );
        const recordsToTelegram = [...listAlbums, ...gifVideos];
        const promises = list.length
          ? arrayIds.map((chatId) =>
              this.bot.sendFridayContentVideo({
                chatId,
                list: recordsToTelegram,
              })
            )
          : [];
        return Promise.all(promises);
      })
      .then((resultWork) => this.analyzeModerateWork(resultWork, res))
      .catch((e) => res.status(400).json({ error: e }));
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
   * @param {Object} params
   * @param {number} params.limit - Максимальное количество записей
   * @param {string} params.name - Название канала
   * @param {boolean} params.filterContent - Фильтровать контент?
   * @param {Response} res
   */
  getNSFW = (params, res) => {
    const { limit = 20, name = "nsfw", filterContent = true } = params;
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
   * @param {Object} params
   * @param {number} params.limit - Максимальное количество записей
   * @param {string} params.name - Название канала
   * @param {boolean} params.filterContent - Фильтровать контент?
   * @param {Response} res
   */
  getVideoNSFW = (params, res) => {
    const { limit = 20, name = "nsfw", filterContent = true } = params;
    // Определиться с количеством записей
    const count = +limit;
    return this.bot.reddit
      .getNewVideoRecords({
        limit: count === NaN ? 20 : count > 50 ? 50 : count,
        name,
        filterContent,
      })
      .then((records) => {
        res.status(200).json({ records, name });
      });
  };

  /**
   * Возвращает список каналов
   * @param {Request} req
   * @param {Response} res
   */
  getListChannels = asyncHandler(async (req, res) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    const channels = await this.bot.db.getListChannels();
    return res.status(200).json({ channels });
  });

  /**
   * Получить контент для модерирования
   * @param {Request} req
   * @param {Response} res
   */
  getContent = (req, res) => {
    const {
      type = "photo",
      channel = "nsfw",
      filterContent = false,
      limit = 50,
    } = req.query;
    if (type === "photo") {
      return this.getNSFW({ name: channel, filterContent, limit }, res);
    }
    if (type === "video") {
      return this.getVideoNSFW({ name: channel, filterContent, limit }, res);
    }
    res.status(422).json({
      status: false,
      validationErrors: [{ type: "Unknown value" }],
    });
  };

  /**
   * Анализ и выдача результатов работы промисов
   * отправки модерируемого контента
   * @param {Array} resultWork
   * @param {Response} res
   * @returns
   */
  analyzeModerateWork = (resultWork, res) => {
    //resultWork это результат работы промисов.
    // Задача в том, чтобы найти промис, где есть ошибка
    const errorInPromise = resultWork.find((item) =>
      item.some((re) => re.status === "error")
    );
    if (errorInPromise) {
      const error = Array.isArray(errorInPromise)
        ? errorInPromise[0]
        : errorInPromise;
      return res.status(400).json(error);
    }
    return res.status(200).json({ status: "ok" });
  };
}
module.exports = FridayRouter;
