import express, { Router } from "express";
import * as dotenv from "dotenv";

import BASE_URL from "../const/baseUrl";
import type TelegramBot from "./telegramBot";

dotenv.config();

/**
 * Создание роутера для телеграмм-бота:
 * 1. Создаёт веб-хук для бота
 */
class AppBotRouter<TypeBot extends TelegramBot> {
  router: Router;
  /**
   * Создаёт для бота веб=хук и привязывает его к адресу.
   * @param {TelegramBot} bot Бот
   * @param {string} baseUrl URL апи, к которому привязать веб-хук
   */
  constructor(bot: TypeBot, baseUrl: string) {
    const urlWebHook = `${BASE_URL}${baseUrl}/webhook`;
    this.router = express.Router();
    // Если проект запускать локально, то
    // веб-хук не нужен.
    if (urlWebHook.startsWith("https")) {
      this.router.post("/webhook", (req, res) => {
        bot.bot.processUpdate(req.body);
        res.sendStatus(200);
      });
      bot.bot.setWebHook(urlWebHook);
    }
  }
}
export default AppBotRouter;
