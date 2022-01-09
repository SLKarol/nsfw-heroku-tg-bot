import { body } from "express-validator";

import type NSFWBot from "../bots/NSFWBot";

import type FridayController from "../controllers/friday";

import AppBotRouter from "../lib/appBotRouter";

/**
 * Создание апи-методов для работы с ботом.
 * Основан на AppBotRouter, так что веб-хук появится по умолчанию.
 */
export default class FridayRouter extends AppBotRouter<NSFWBot> {
  /**
   * Создаёт веб-хук и методы для работы с ботом
   * @param {NSFWBot} bot
   * @param {string} baseUrl URL апи, к которому привязать веб-хук
   */
  constructor(bot: NSFWBot, baseUrl: string, controller: FridayController) {
    super(bot, baseUrl);
    const validateChannelFormData = [
      body("name").not().isEmpty().withMessage("Name is required"),
    ];
    this.router.post("/sendFriday", controller.sendFriday);
    this.router.post("/sendFridayVideo", controller.sendFridayVideo);
    this.router.post("/sendBOR", controller.sendBOR);
    this.router.get("/content", controller.getContent);
    this.router.post("/postFridayTelegram", controller.postFridayTelegram);
    this.router.get("/channels", controller.getListChannels);
    this.router.post(
      "/channels",
      validateChannelFormData,
      controller.addChannel
    );
    this.router.put(
      "/channels/:channelId",
      validateChannelFormData,
      controller.editChannel
    );
    this.router.delete("/channels/:channelId", controller.deleteChannel);
    this.router.post("/postListVideo", controller.postListVideo);
    this.router.post("/postVideo", controller.postVideo);
    this.router.post("/fridayMailing", controller.fridayMailing);
  }
}
