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
  url?: string; //string | Buffer; //ArrayLike<number> |

  /**
   * Это видео?
   */
  is_video?: boolean;
  /**
   * Характеристики видео
   */
  media?: RedditApiMedia | Buffer | null; //RedditApiMedia | string | Buffer;
  /**
   * Картинка - превью
   */
  preview?: {
    images: RedditApiImages;
  };
}

export type ResponseApiData = {
  data: IRedditApiRerod;
};
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

/**
 * Параметры запроса записей из Reddit
 */
export type RequestRedditRecords = {
  /**
   * Имя канала
   */
  name: string;
  /**
   * Максимальное к-во записей
   */
  limit?: number;
  /**
   * Фильтровать на запрещённые слова?
   */
  filterContent?: boolean;
};

/**
 * Записи Reddit, состоящие из изображений/видео для отправки в телеграм
 */
export interface RedditMediaTelegram extends Partial<IRedditApiRerod> {
  /**
   * Заголовок
   */
  caption: string;
  /**
   * Сообщение без ошибок?
   */
  correct?: boolean;

  type?: MediaType;
  /**
   * Ссылка на аудиодорожку
   */
  urlAudio?: string;
}

/**
 * Тип медиаконтента
 */
type MediaType = "video" | "photo";
