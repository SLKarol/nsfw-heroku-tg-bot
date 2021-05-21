import fetch from "node-fetch";
import delay from "@stanislavkarol/delay";
import asyncHandler from "express-async-handler";
import express from "express";
import { body, validationResult } from "express-validator";

import BASE_URL from "../const/baseUrl";
import { IRedditApiRerod, RedditMediaTelegram } from "../types/reddit";
import { RecordBor } from "../types/bor";
import type NSFWBot from "../bots/NSFWBot";
import {
  GetNSFWParams,
  ParamAnalyzer,
  RequestFriday,
} from "../types/fridayRouter";

import AppBotRouter from "../lib/appBotRouter";
import { getHolydayMessage } from "../lib/isFriDay";

/**
 * @typedef {import('../bots/NSFWBot.js')} NSFWBot
 *

/**
 * Создание апи-методов для работы с ботом.
 * Основан на AppBotRouter, так что веб-хук появится по умолчанию.
 */
class FridayRouter extends AppBotRouter<NSFWBot> {
  /**
   * Создаёт веб-хук и методы для работы с ботом
   * @param {NSFWBot} bot
   * @param {string} baseUrl URL апи, к которому привязать веб-хук
   */
  constructor(bot: NSFWBot, baseUrl: string) {
    super(bot, baseUrl);
    const validateChannelFormData = [
      body("name").not().isEmpty().withMessage("Name is required"),
    ];
    this.router.post("/sendFriday", this.sendFriday);
    this.router.post("/sendFridayVideo", this.sendFridayVideo);
    this.router.post("/sendBOR", this.sendBOR);
    this.router.get("/content", this.getContent);
    this.router.post("/postFridayTelegram", this.postFridayTelegram);
    this.router.get("/channels", this.getListChannels);
    this.router.post("/channels", validateChannelFormData, this.addChannel);
    this.router.put(
      "/channels/:channelId",
      validateChannelFormData,
      this.editChannel
    );
    this.router.delete("/channels/:channelId", this.deleteChannel);
    this.router.post("/postListVideo", this.postListVideo);
    this.router.post("/postVideo", this.postVideo);
  }

  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   */
  sendFriday = asyncHandler(
    async (req: express.Request, res: express.Response) => {
      const { records = [], name = "" } = req.body;
      // Получить Название канала
      const infoChannel = await this.bot.getChannelInfo(name);
      // Получить название праздника
      const holidayMessage = await getHolydayMessage();
      // Если название канала некорректное или его нет, то найти случайный канал
      if (!name || !infoChannel.correct) {
        infoChannel.name = (await this.bot.db.getRandomChannel()).name;
      }
      // Получить ID Чатов для рассылки
      const prChatIds = this.getChatForMailing();
      // Получить список изображений
      const prFridayImages = !records.length
        ? this.bot.reddit.getNewRecords({ limit: 20, name: infoChannel.name })
        : new Promise<RedditMediaTelegram[]>((resolve) => resolve(records));
      const [chatIds, fridayImages] = await Promise.all([
        prChatIds,
        prFridayImages,
      ]);
      const fridayMessages = this.bot.createAlbums(
        fridayImages as IRedditApiRerod[],
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
  sendFridayVideo = asyncHandler(async (req, res) => {
    const { records = [], name = "" } = req.body;
    // Если не прислали видео, значит на этом закончена работа
    if (!records.length) {
      return res.status(200).json({ success: true });
    }
    // Получить ID Чатов для рассылки
    const chatIds = await this.getChatForMailing();
    if (!chatIds.length) {
      return res.status(200).json({ success: true });
    }
    // Получить Название канала
    const infoChannel = await this.bot.getChannelInfo(name);
    // Получить название праздника
    const holidayMessage = await getHolydayMessage();
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
  });

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
   * Возвращает записи для модерирования рассылки
   * @param {Object} params
   * @param {number} params.limit - Максимальное количество записей
   * @param {string} params.name - Название канала
   * @param {boolean} params.filterContent - Фильтровать контент?
   * @param {Response} res
   */
  getNSFW = (params: Partial<GetNSFWParams>, res: express.Response) => {
    const { limit = 20, name = "nsfw", filterContent = false } = params;
    // Определиться с количеством записей
    const count = +limit;
    return this.bot.reddit
      .getNewRecords({
        limit: count === NaN ? 20 : count > 50 ? 50 : count,
        name,
        filterContent,
      })
      .then((records) => {
        return res.status(200).json({ records, name });
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
   * Анализ и выдача результатов работы промисов
   * отправки модерируемого контента
   * @param {Array<ParamAnalyzer>} resultWork
   * @param {Response} res
   * @returns
   */
  analyzeModerateWork = (
    resultWork: ParamAnalyzer[],
    res: express.Response
  ) => {
    //resultWork это результат работы промисов.
    // Задача в том, чтобы найти промис, где есть ошибка
    const errorInPromise = resultWork.find((item) =>
      item.some((re) => !re.success)
    );
    if (errorInPromise) {
      const error = Array.isArray(errorInPromise)
        ? errorInPromise[0]
        : errorInPromise;
      return res.status(400).json(error);
    }
    return res.status(200).json({ success: true });
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
   * Добавить канал
   */
  addChannel = (req: express.Request, res: express.Response) => {
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
  editChannel = (req: express.Request, res: express.Response) => {
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
  postListVideo = asyncHandler(async (req, res) => {
    const { records, chatId, channel, holidayMessage } = req.body;
    await this.bot.introFriday({
      channelName: channel,
      chatId,
      holidayMessage,
    });
    const url = `${BASE_URL}/api/botFriday/postVideo`;
    records.forEach((r: any) => {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          record: r,
        }),
      });
    });
  });

  /**
   * Отправка одного видео в телеграмм-контакт
   */
  postVideo = (req: express.Request, res: express.Response) => {
    const { record, chatId } = req.body;
    const videoRecord = this.bot.reddit.mapVideoRedditForTelegram(record);
    this.bot
      .sendFridayContentVideo({ chatId, video: videoRecord })
      .then(() => res.status(200).json({ success: true }))
      .catch((error) =>
        res.status(500).json({ success: false, message: error })
      );
  };
}

export default FridayRouter;
