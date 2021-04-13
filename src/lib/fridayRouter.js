const AppBotRouter = require("./appBotRouter");

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
  }

  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFriday = (req, res) => {
    const { records = [] } = req.body;
    const prChatIds = this.getChatForMailing();
    const prFridayMessages = !records.length
      ? this.bot.reddit.getNewRecords()
      : new Promise((resolve, reject) => resolve(records));
    return Promise.all([prChatIds, prFridayMessages])
      .then(([chatIds, records]) => {
        const fridayMessages = this.bot.reddit.getPartsMessage(records);
        // Защититься от повторного запроса
        const promises = chatIds.map((chatId) =>
          this.bot.sendFridayContent({ chatId, fridayMessages })
        );
        return Promise.all(promises);
      })
      .then(() => res.sendStatus(200));
  };

  /**
   * Отправить всем подписчикам пятничную видео-рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFridayVideo = (req, res) => {
    const prChatIds = this.getChatForMailing();
    const prFridayMessages = this.bot.reddit.getNewVideoRecords();
    Promise.all([prChatIds, prFridayMessages])
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
  };

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
    const { limit = 20 } = req.body;
    // Определиться с количеством записей
    const count = +limit;
    this.bot.reddit
      .getNewRecords(count === NaN ? 20 : count > 50 ? 50 : count)
      .then((records) => {
        res.status(200).json({ records });
      });
  };
}
module.exports = FridayRouter;
