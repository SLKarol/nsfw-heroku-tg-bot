import { RedditMediaTelegram } from "./reddit";

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

  // type
};

export type RequestContent = {
  /**
   * Тип контента
   */
  type: "photo" | "video";
  /**
   * Название канала
   */
  channel: string;
  /**
   * Фильтровать контент на предмет запрещённых слов?
   */
  filterContent: boolean;
  /**
   * Максимальное к-во записей
   */
  limit: number;
};

export type ParamAnalyzer = (
  | { success: boolean }
  | { success: boolean; message: any }
)[];

export type RequestFriday = {
  fridayMessages: RedditMediaTelegram[][];
  chatId: string;
  channel: string;
  holidayMessage?: string;
};
