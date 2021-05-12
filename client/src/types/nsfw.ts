import { TChannel } from "../../../src/types/channel";

export type TypeNSFW = "video" | "photo";

export interface NSFWChannel extends TChannel {
  _id: string;
}

/**
 * Запись из Reddit
 */
export interface IRedditApiRerod {
  /**
   * Заголовок
   */
  title: string;
  /**
   * Url картинки/видео
   */
  url?: string;

  /**
   * Это видео?
   */
  is_video?: boolean;
  /**
   * Характеристики видео
   */
  media?: RedditApiMedia | Buffer | null;
  /**
   * Картинка - превью
   */
  preview?: {
    images: RedditApiImages;
  };

  urlAudio?: string;
}

/**
 * Блок media в ответе reddit
 */
export interface RedditApiMedia {
  type?: null | string;
  reddit_video?: {
    fallback_url: string;
  };
}

/**
 * Блок images в ответе reddit
 */
type RedditApiImages = {
  source: {
    url: string;
    width: number;
    height: number;
  }[];
};

export type ResponseListRecords = {
  records: IRedditApiRerod[];
  callbackMapname: string;
};
