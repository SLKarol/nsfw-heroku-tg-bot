import express from "express";
import asyncHandler from "express-async-handler";
import fetch from "node-fetch";
import delay from "@stanislavkarol/delay";
import { validationResult } from "express-validator";

import BASE_URL from "../const/baseUrl";

import type NSFWBot from "../bots/NSFWBot";
import type {
  GetNSFWParams,
  PostVideo,
  RequestFriday,
  RequestSendFriday,
} from "../types/fridayRouter";
import type { RedditTelegram } from "../types/reddit";
import type { RecordBor } from "../types/bor";
import type { TChannel } from "../types/channel";
import AppBotController from "../lib/appBotController";

import { getHolidayMessage, isFriDay } from "../lib/isFriDay";

export default class FridayController extends AppBotController<NSFWBot> {
  constructor(bot: NSFWBot) {
    super(bot);
  }
  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   */
  sendFriday = asyncHandler(
    async (
      req: express.Request<{}, {}, RequestSendFriday>,
      res: express.Response
    ) => {
      const { records = [], channel = "" } = req.body;
      // Получить Название канала
      const infoChannel = await this.bot.getChannelInfo(channel);
      // Получить название праздника
      const holidayMessage = await getHolidayMessage();
      // Если название канала некорректное или его нет, то найти случайный канал
      if (!channel || !infoChannel.correct) {
        infoChannel.name = (await this.bot.db.getRandomChannel()).name;
      }
      // Получить ID Чатов для рассылки
      const prChatIds = this.getChatForMailing();
      // Получить список изображений
      const prFridayImages = !records.length
        ? this.bot.reddit.getNewRecords(infoChannel.name)
        : new Promise<RedditTelegram[]>((resolve) => resolve(records));
      const [chatIds, fridayImages] = await Promise.all([
        prChatIds,
        prFridayImages,
      ]);
      const fridayMessages = this.bot.createAlbums(
        fridayImages,
        this.bot.reddit.mapRedditForTelegram
      );
      // Получить ссылку на метод, который отправляет альбомы
      const url = `${BASE_URL}/api/botFriday/postFridayTelegram`;
      // Отправить сформированные альбомы в телеграм
      for (const id of chatIds) {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: id,
            fridayMessages,
            channel: infoChannel.name,
            holidayMessage,
          }),
        });
      }
      res.status(200).json({ success: true });
    }
  );

  /**
   * Отправить всем подписчикам пятничную видео-рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   * @param {Request} req
   * @param {Response} res
   */
  sendFridayVideo = asyncHandler(
    async (req: express.Request<{}, {}, RequestSendFriday>, res) => {
      const { records = [], channel = "" } = req.body;
      // Если не прислали видео, значит на этом закончена работа
      if (!records.length) {
        res.status(200).json({ success: true });
        return;
      }
      // Получить ID Чатов для рассылки
      const chatIds = await this.getChatForMailing();
      if (!chatIds.length) {
        res.status(200).json({ success: true });
        return;
      }
      // Получить Название канала
      const infoChannel = await this.bot.getChannelInfo(channel);
      // Получить название праздника
      const holidayMessage = await getHolidayMessage();
      // Отправить альбомы в телеграм, каждому клиенту
      const url = `${BASE_URL}/api/botFriday/postListVideo`;
      for (const id of chatIds) {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: id,
            records,
            channel: infoChannel.name,
            holidayMessage,
          }),
        });
      }

      res.status(200).json({ success: true });
    }
  );

  /**
   * Отправить выпуски БОР через телеграм
   */
  sendBOR = (req: express.Request, res: express.Response) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    this.getChatForMailing()
      .then((chatIds) => {
        const articles = Array.from(req.body) as RecordBor[];
        const promises = chatIds.map((chatId) =>
          this.sendBORContent({ chatId, articles })
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
  private sendBORContent = ({
    chatId,
    articles,
  }: {
    chatId: string;
    articles: RecordBor[];
  }) => {
    const { bot } = this.bot;
    const promises: Promise<any>[] = [];
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
   * Получить контент для модерирования
   * @param {Request} req
   * @param {Response} res
   */
  getContent = asyncHandler(async (req, res) => {
    const {
      type = "photo",
      channel = "nsfw",
      filterContent = false,
      limit = 50,
    } = req.query;
    if (type === "photo") {
      return await this.getNSFW(
        { name: channel.toString(), limit: Number(limit) },
        res
      );
    }
    if (type === "video") {
      return await this.getVideoNSFW(
        {
          name: channel.toString(),
          limit: Number(limit),
          filterContent: filterContent as boolean,
        },
        res
      );
    }
    res.status(422).json({
      success: false,
      validationErrors: [{ type: "Неизвестный тип содержимого" }],
    });
  });

  /**
   * Возвращает записи для модерирования рассылки
   * @param {Object} params
   * @param {number} params.limit - Максимальное количество записей
   * @param {string} params.name - Название канала
   * @param {boolean} params.filterContent - Фильтровать контент?
   * @param {Response} res
   */
  private getNSFW = (params: Partial<GetNSFWParams>, res: express.Response) => {
    const { limit = 20, name = "nsfw", filterContent = false } = params;
    // Определиться с количеством записей
    const count = +limit;
    return this.bot.reddit
      .getNewRecords(name, count === NaN ? 20 : count > 50 ? 50 : count)
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
  getVideoNSFW = (params: GetNSFWParams, res: express.Response) => {
    const { limit = 20, name = "nsfw", filterContent = true } = params;
    // Определиться с количеством записей
    const count = +limit;
    return this.bot.reddit
      .getNewVideoRecords(name, count === NaN ? 20 : count > 50 ? 50 : count)
      .then((records) => {
        res.status(200).json({ records, name });
      });
  };

  /**
   * Отправка пятничного содержимого в телеграмм-канал
   */
  postFridayTelegram = (
    req: express.Request<{}, {}, RequestFriday>,
    res: express.Response
  ) => {
    const { fridayMessages, chatId, channel, holidayMessage } = req.body;
    this.bot
      .sendFridayContent({ chatId, fridayMessages, channel, holidayMessage })
      .then(() => res.status(200).json({ success: true }))
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };

  /**
   * Возвращает список каналов
   * @param {Request} req
   * @param {Response} res
   */
  getListChannels = asyncHandler(async (req, res) => {
    if (!req.isAuth) {
      res.status(401).json({ message: "Ошибка авторизации", success: false });
      return;
    }
    const channels = await this.bot.db.getListChannels();
    res.status(200).json({ channels });
  });

  /**
   * Добавить канал
   */
  addChannel = (
    req: express.Request<{}, {}, TChannel>,
    res: express.Response
  ) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          validationErrors: errors.array(),
        });
      }
    }
    const { name, withVideo, moderationRequired } = req.body;
    this.bot.db
      .addNewChannel(name, withVideo, moderationRequired)
      .then((result) => {
        return res
          .status(200)
          .json({ success: true, message: result.insertedId });
      })
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };

  /**
   * Редактировать канал
   */
  editChannel = (
    req: express.Request<{ channelId: string }, {}, TChannel>,
    res: express.Response
  ) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }

    const channelId = req.params.channelId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          validationErrors: errors.array(),
        });
      }
    }
    const { name, withVideo, moderationRequired } = req.body;
    this.bot.db
      .updateChannel(channelId, name, withVideo, moderationRequired)
      .then(() => {
        return res.status(200).json({ success: true });
      })
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };

  /**
   * Удалить реддит-канал из БД
   */
  deleteChannel = (req: express.Request, res: express.Response) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    const channelId = req.params.channelId;
    this.bot.db
      .deleteChannel(channelId)
      .then(() => {
        return res.status(200).json({ success: true });
      })
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };

  /**
   * Отправляет список видео
   */
  postListVideo = asyncHandler(
    async (req: express.Request<{}, {}, RequestSendFriday>, res) => {
      const { records = [], chatId, channel, holidayMessage } = req.body;
      await this.bot.introFriday({
        channelName: channel,
        chatId,
        holidayMessage,
      });
      const url = `${BASE_URL}/api/botFriday/postVideo`;
      records.forEach((record) => {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId,
            record,
          }),
        });
      });
      res.status(200).json({ success: true });
    }
  );

  /**
   * Отправка одного(!) видео в телеграмм-контакт
   */
  postVideo = (
    req: express.Request<{}, {}, PostVideo>,
    res: express.Response
  ) => {
    const { record, chatId } = req.body;
    const { url = "", title = "" } = record;
    const video = this.bot.reddit.prepareVideoForTelegram(url);
    this.bot
      .sendFridayContentVideo({ chatId, video, title })
      .then(() => res.status(200).json({ success: true }))
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };

  /**
   * Рассылка, в зависимости от дня недели (и праздника)
   */
  fridayMailing = asyncHandler(async (req, res) => {
    const isDate = await isFriDay();
    let status = "not sent";
    if (isDate) {
      status = "sent";
      fetch(`${BASE_URL}/api/botFriday/sendFriday/`, {
        method: "POST",
      });
    }
    res.status(200).json({ status });
  });
}
