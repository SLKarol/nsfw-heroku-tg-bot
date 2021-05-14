import fetch from "node-fetch";
import delay from "@stanislavkarol/delay";
import asyncHandler from "express-async-handler";
import express from "express";
import { body, validationResult } from "express-validator";

import BASE_URL from "../const/baseUrl";
import { IRedditApiRerod } from "../types/reddit";
import { RecordBor } from "../types/bor";

import type NSFWBot from "../bots/NSFWBot";
import {
  RequestContent,
  GetNSFWParams,
  ParamAnalyzer,
} from "../types/fridayRouter";

import AppBotRouter from "../lib/appBotRouter";

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
  }

  /**
   * Отправить всем подписчикам пятничную рассылку.
   * Если в параметре records ничего не передавать,
   * То будет запрос к reddit
   */
  sendFriday = asyncHandler(
    async (req: express.Request, res: express.Response) => {
      const { records = [], name } = req.body;
      // Получить Название канала
      const infoChannel = await this.bot.getChannelInfo({
        commandArgs: [name],
        text: "",
      });
      // Получить ID Чатов для рассылки
      const prChatIds = this.getChatForMailing();
      // Получить список изображений
      const prFridayImages = !records.length
        ? this.bot.reddit.getNewRecords({ limit: 20, name: infoChannel.name })
        : new Promise<IRedditApiRerod[]>((resolve) => resolve(records));
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
          body: JSON.stringify({ chatId: id, fridayMessages }),
        });
      }
      res.status(200).json({ status: "ok" });
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
    const { records = [], name = "nsfw", filterContent = true } = req.body;
    // Получить Название канала
    const infoChannel = await this.bot.getChannelInfo({
      commandArgs: [name],
      text: "",
    });
    // Получить сообщения для рассылки
    const prFridayMessages = !records.length
      ? this.bot.reddit.getNewVideoRecords({
          limit: 10,
          name: infoChannel.name,
          filterContent,
        })
      : new Promise<IRedditApiRerod[]>((resolve) => resolve(records));
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
      .then((resultWork) =>
        this.analyzeModerateWork(resultWork as ParamAnalyzer[], res)
      )
      .catch((e) => res.status(400).json({ error: e }));
  });

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
      status: false,
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

  /**
   * Отправка пятничного содержимого в телеграмм-канал
   */
  postFridayTelegram = (req: express.Request, res: express.Response) => {
    const { fridayMessages, chatId } = req.body;
    this.bot
      .sendFridayContent({ chatId, fridayMessages })
      .then(() => res.status(200).json({ status: "ok" }))
      .catch((error) => res.status(500).json({ error }));
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
          status: false,
          validationErrors: errors.array(),
        });
      }
    }
    const { name, withVideo, moderationRequired } = req.body;
    this.bot.db
      .addNewChannel(name, withVideo, moderationRequired)
      .then((result) => {
        return res.status(200).json({ id: result.insertedId });
      })
      .catch((error) => res.status(500).json({ error }));
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
          status: false,
          validationErrors: errors.array(),
        });
      }
    }
    const { name, withVideo, moderationRequired } = req.body;
    this.bot.db
      .updateChannel(channelId, name, withVideo, moderationRequired)
      .then(() => {
        return res.status(200).json({ status: "ok" });
      })
      .catch((error) => res.status(500).json({ error }));
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
      .then((r) => {
        return res.status(200).json({ status: "ok", result: r.result });
      })
      .catch((error) => res.status(500).json({ error }));
  };
}

export default FridayRouter;
