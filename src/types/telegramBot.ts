import { BotCommand } from "node-telegram-bot-api";

import { RedditTelegram } from "./reddit";

export interface CreateBot {
  /**
   * TOKEN телеграм-бота
   */
  token: string;
  /**
   * Массив команд для построения подсказки
   */
  commands?: CustomBotCommand[];
  /**
   * Название рассылки
   */
  mailingName: string;
}

export interface CustomBotCommand extends BotCommand {
  /**
   * Использовать для подсказки юзеру?
   */
  hint?: boolean;
  /**
   * Не выводить по команде справка
   */
  hideHelp?: boolean;
}

/**
 * Разобранный текст сообщения от пользователя
 */
export interface ParsedCommandText {
  /**
   * Введенный текст
   */
  text: string;

  /**
   * Введённая команда
   */
  command?: string | null;

  /**
   * Бот, к которому обратились
   */
  bot?: string | null;

  /**
   * Аргументы к введённой команде
   */
  commandArgs?: string[];
}

/**
 * Команда телеграмм и её обработчик
 */
export interface BotCommandHandler {
  command: string;
  handler: HandlerExecCommand;
}

/**
 * Обработчик команд для телеграмм-бота
 */
export type HandlerExecCommand = (
  chatId: number | string,
  parsedMessage: ParsedCommandText
) => Promise<any>;
