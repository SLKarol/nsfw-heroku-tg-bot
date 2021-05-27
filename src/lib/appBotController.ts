import express from "express";
import * as dotenv from "dotenv";

import type TelegramBot from "./telegramBot";

/**
 * Создание контроллера для роутера
 * Содержит метод поиска подписчиков
 */
export default class AppBotController<TypeBot extends TelegramBot> {
  bot: TypeBot;

  constructor(bot: TypeBot) {
    this.bot = bot;
  }

  /**
   * Возвращает список ID чатов для рассылки
   */
  async getChatForMailing() {
    const ids = await this.bot.manageSubscribe?.getChatIdsForMailing();
    if (!ids) return [];
    const promiseArray = [];
    for (const chatId of ids) {
      promiseArray.push(
        this.canSendMessage(chatId).catch(() => ({
          chatId: chatId,
          possibleSend: false,
        }))
      );
    }
    const promise = Promise.all(promiseArray);
    return promise.then((array) =>
      array.reduce((acc: string[], item) => {
        if (item && item.possibleSend) {
          acc.push(item.chatId);
        }
        return acc;
      }, [])
    );
  }

  /**
   * Проверка того, что можно отправить сообщение
   * @param {string | number} chatId ID чата
   * @returns {Promise<Object>}
   */
  private async canSendMessage(chatId: string) {
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
