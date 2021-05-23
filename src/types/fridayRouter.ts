import { InputMediaPhoto } from "node-telegram-bot-api";

import { RedditTelegram } from "./reddit";

export type GetNSFWParams = {
  /**
   * Максимальное количество записей
   */
  limit: number;
  /**
   * Название канала
   */
  name: string;

  /**
   * Фильтровать контент на предмет запрещённых слов?
   */
  filterContent: boolean;
};

export type ParamAnalyzer = (
  | { success: boolean }
  | { success: boolean; message: any }
)[];

export type RequestFriday = {
  fridayMessages: InputMediaPhoto[][];
  chatId: string;
  channel: string;
  holidayMessage?: string;
};

export type RequestSendFriday = {
  records?: RedditTelegram[];
  chatId: string;
  channel: string;
  holidayMessage?: string;
};

export type PostVideo = {
  record: RedditTelegram;
  chatId: string;
};
