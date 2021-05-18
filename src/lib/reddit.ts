import * as dotenv from "dotenv";
import { parse } from "node-html-parser";
import fetch from "node-fetch";

import {
  IRedditApiRerod,
  RedditApiMedia,
  RequestRedditRecords,
  ResponseApiData,
  RedditMediaTelegram,
  CorrectImageDimension,
} from "../types/reddit";
import FORBIDDEN_WORDS from "../const/forbiddenWords";

import isCorrectImage from "./isCorrectImage";
import { isCorrectImageDimension } from "./typeGuards";

const { Client } = require("node-reddit-js");
dotenv.config();

/**
 * Вспомогательный класс работы с reddit
 */
class Reddit {
  private config = {
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  };
  private client: any;

  /**
   * Вспомогательный класс работы с reddit
   */
  constructor() {
    this.client = new Client(this.config);
  }
  /**
   * Получает новые записи NFSW
   * @param {Object} props
   * @param {number} props.limit Максимальное количество фото
   * @param {string} props.name имя канала
   * @param {boolean} props.filterContent - Фильтровать контент?
   * @returns {Promise<IRedditApiRerod[]>}
   */
  async getNewRecords({ limit = 20, name = "nsfw", filterContent = true }) {
    const recordsReddit = await this.requestRedditRecords({
      limit,
      name,
      filterContent,
    });
    const records = await this.filterAvailableCorrectImages(recordsReddit);
    return records;
  }

  /**
   * Подготовить массив к обработке - убрать из него лишнюю информацию
   * @param {Array<ResponseApiData>} data - Запись IRedditApiRerod с лишними данными, кои нужно очистить
   * @param {boolean} [video=false] - Подготовить для видео?
   * @returns {Array<IRedditApiRerod>}
   */
  private prepareRecords(data: ResponseApiData[], video = false) {
    return data.map((record) => {
      const {
        data: { title, url, is_video, media, preview },
      } = record;
      const re: IRedditApiRerod = { title, url, is_video, media };
      // Если изображение, то превью не нужно
      if (!video) {
        return re;
      }
      const previewImages = preview?.images;
      if (Array.isArray(previewImages) && previewImages.length) {
        const { source } = previewImages[0];
        if (source) {
          re.preview = source;
        }
      }
      return re;
    });
  }

  /**
   * Фильтровать по содержимому:
   * По заголовку и по расширению
   * @param {Array} data
   * @param {boolean?} checkUrlImage проверять, соответствует ли url типу "Изображение"
   * @returns {Array}
   */
  private filterContent(data: IRedditApiRerod[], checkUrlImage = false) {
    const forbiddenWords = FORBIDDEN_WORDS.toLowerCase().split(/[ ,]+/);
    // Отфильтровать
    return data.filter((record) => {
      // Исключить из всего этого видео. Я пока не умею его забирать
      const { title, url } = record;
      const tmpLowerCase = title.toLowerCase();
      let condition = !forbiddenWords.some(
        (word) => tmpLowerCase.indexOf(word) > -1
      );
      if (checkUrlImage) {
        condition = condition && !!url?.match(/.(jpg|jpeg|png|gif)$/i);
      }
      return condition;
    });
  }

  /**
   * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
   * @param {Array} records
   * @returns {Promise} Отфильтрованные изображения
   */
  private async filterAvailableCorrectImages(records: IRedditApiRerod[]) {
    const promisesCorrectImages: Promise<CorrectImageDimension | boolean>[] =
      [];
    for (const record of records) {
      promisesCorrectImages.push(
        new Promise((resolve) => {
          const { url = "" } = record;
          resolve(isCorrectImage(url));
        })
      );
    }
    const summaryCorrectImages = await Promise.all(promisesCorrectImages);
    const re = records.reduce((acc: RedditMediaTelegram[], record, idx) => {
      const correctImage = summaryCorrectImages[idx];
      if (isCorrectImageDimension(correctImage)) {
        const { url = "" } = record;
        (record as RedditMediaTelegram).correctImageDimension = (
          correctImage as unknown as CorrectImageDimension
        )[url];
        acc.push(record);
      }
      return acc;
    }, []);
    return re;
  }

  /**
   * Подготовка для отправки в телеграм
   */
  mapRedditForTelegram = (reddit: IRedditApiRerod) => {
    const re = {
      media: reddit.url,
      caption: reddit.title,
      type: reddit.is_video ? "video" : "photo",
    } as RedditMediaTelegram;
    return re;
  };

  /**
   * Подготовка видео для отправки в телеграм
   */
  mapVideoRedditForTelegram = (reddit: IRedditApiRerod) => {
    const { url = "", title } = reddit;
    const re = {
      type: "video",
      caption: title,
      media: url,
    } as RedditMediaTelegram;
    if (typeof url === "string") {
      return re;
    }
    const personUint8Array = Uint8Array.from(url as ArrayLike<number>);
    const buffer = Buffer.from(personUint8Array);
    re.media = buffer;
    return re;
  };

  /**
   * Получает новые видеозаписи NFSW
   * @param {Object} props
   * @param {number} props.limit Максимальное количество фото/видео
   * @param {string} props.name имя канала
   * @param {boolean} props.filterContent - Фильтровать контент?
   * @returns {Promise<Array>}
   */
  async getNewVideoRecords({
    limit = 10,
    name = "tikhot",
    filterContent = true,
  }) {
    const recordsReddit = await this.requestRedditRecords({
      limit,
      name,
      filterContent,
    });
    let promises = recordsReddit.reduce(this.__getVideoUrl, []);
    const arrayRedditMedia = await Promise.all(promises);
    const workRecords = arrayRedditMedia.filter((i) => i !== null && i.url);
    return workRecords;
  }

  /**
   * Выдаёт массив промисов для получения информации о видео
   * @param {Array} listPromises
   * @param {Object} record Запись из reddit
   * @param {string} record.url Ссылка на видео
   * @param {string} record.title Название видео
   * @param {Object} record.media Скомбинированная инфа о видео
   * @return {Promise<Array>} videoRecords
   */
  __getVideoUrl = (
    listPromises: Promise<RedditMediaTelegram | null>[],
    record: IRedditApiRerod
  ) => {
    const { url = "", title, media, preview = undefined } = record;
    // Это gifv?
    if (!!url.match(/.(gifv)$/i)) {
      listPromises.push(
        new Promise((resolve) =>
          resolve({
            url: url.replace(".gifv", ".mp4"),
            title,
            preview,
          })
        )
      );
      return listPromises;
    }
    // В остальных случаях должен быть объект media
    if (!media) {
      return listPromises;
    }
    // Это видео типа redgifs.com?
    const { type = "" } = media as RedditApiMedia;
    if (type === "redgifs.com") {
      const recordUrl = this.__parseRedgifsUrl(record);
      // Удалось получить ссылку на mp4?
      if (recordUrl.endsWith(".mp4")) {
        listPromises.push(
          new Promise((resolve) => resolve({ title, url: recordUrl, preview }))
        );
        return listPromises;
      }
      // Если есть ссылка, то распарсить из неё video
      if (recordUrl) {
        listPromises.push(
          new Promise((resolve) =>
            fetch(recordUrl).then((response) =>
              response.text().then((htmlContent) => {
                const root = parse(htmlContent);
                const source = root.querySelector("video>source");
                if (source !== null) {
                  const { src, type } = source.rawAttributes;
                  if (type === "video/mp4") {
                    resolve({ url: src, title, preview });
                  }
                }
                resolve(null);
              })
            )
          )
        );
      }
      return listPromises;
    }
    // Это обычное видео?
    const fallbackUrl = (media as RedditApiMedia)?.reddit_video?.fallback_url;
    if (fallbackUrl) {
      const urlVideo = fallbackUrl.split("?")[0];
      const fileName = urlVideo.substring(urlVideo.lastIndexOf("/") + 1);
      if (!fileName.startsWith("DASH_")) {
        return listPromises;
      }
      const urlAudio = urlVideo.replace(fileName, "DASH_audio.mp4");
      listPromises.push(
        new Promise((resolve) =>
          resolve({ url: urlVideo, title, urlAudio, preview })
        )
      );

      return listPromises;
    }
    return listPromises;
  };

  /**
   * Получить записи reddit
   */
  private async requestRedditRecords({
    name = "nsfw",
    limit = 20,
    filterContent = true,
  }: RequestRedditRecords) {
    const nsfwResponse = await this.client
      .reddit(`r/${name.toLowerCase()}`)
      .new.get({
        data: { limit },
      });
    const {
      data: { children },
    } = nsfwResponse;

    const recordsWork = filterContent
      ? this.filterContent(this.prepareRecords(children))
      : this.prepareRecords(children);
    return recordsWork;
  }

  /**
   * Разобрать адрес из записи или media
   */
  __parseRedgifsUrl(record: IRedditApiRerod) {
    const media = record.media as RedditApiMedia;
    // Если есть url и пустое media, значит url отправить
    if (record.url && !media) {
      return record.url || "";
    }
    if ("media" in record) {
      // Порядок парсинга урла такой: сперва thumbnail_url, затем html
      const thumbnailUrl = media.oembed?.thumbnail_url || "";
      // Если есть thumbnailUrl, то разобрать его
      if (thumbnailUrl) {
        // Изменить расширение у превью на .mp4
        return thumbnailUrl.substr(0, thumbnailUrl.lastIndexOf(".")) + ".mp4";
      }
      // Если есть html, то его разобрать
      const html = media.oembed?.html || "";
      if (html) {
        const iframe = parse(html).querySelector("iframe");
        if (iframe) {
          return iframe.getAttribute("src") || "";
        }
      }
    }
    return record.url || "";
  }
}
export default Reddit;
