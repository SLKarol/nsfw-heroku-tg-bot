import Snoowrap, { Submission } from "snoowrap";
import { parse } from "node-html-parser";
import { InputMediaPhoto, InputMediaVideo } from "node-telegram-bot-api";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

import { CorrectImageDimension } from "../types/reddit";
import isCorrectImage from "./isCorrectImage";
import { isCorrectImageDimension } from "./typeGuards";
import { RedditTelegram } from "../types/reddit";

dotenv.config();

/**
 * Вспомогательный класс работы с reddit
 */
class Reddit {
  private client: Snoowrap;
  constructor() {
    const userAgent = `Node.js/${process.version}:snoowrap:v1.23.0 (by /u/${process.env.REDDIT_USER_NAME})`;
    this.client = new Snoowrap({
      userAgent,
      clientId: process.env.REDDIT_APP_ID,
      clientSecret: process.env.REDDIT_API_SECRET,
      username: process.env.REDDIT_USER_NAME,
      password: process.env.REDDIT_PASSWORD,
    });
  }

  /**
   * Получает новые записи reddit
   */
  getNewRecords = async (name: string, limit = 20) => {
    const records = await this.requestNewEntries({ name, limit });
    return await this.filterAvailableCorrectImages(records);
  };

  /**
   * Запрос новых записей reddit
   */
  private requestNewEntries = async ({ limit = 20, name = "nsfw" }) => {
    const re = (await this.client.getNew(name, { limit })).map((record) => {
      const { url, media, title, preview } = record;
      return { url, media, title, preview };
    });
    return re;
  };

  /**
   * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
   * @param {Array} records
   * @returns {Promise} Отфильтрованные изображения
   */
  private async filterAvailableCorrectImages(records: Partial<Submission>[]) {
    const promisesCorrectImages: Promise<CorrectImageDimension | boolean>[] =
      [];
    // Просмотреть изображения, составить отчёт о корректности
    for (const record of records) {
      promisesCorrectImages.push(
        new Promise((resolve) => {
          const { url = "" } = record;
          resolve(isCorrectImage(url));
        })
      );
    }
    const summaryCorrectImages = await Promise.all(promisesCorrectImages);

    const re = records.reduce((acc: RedditTelegram[], record, idx) => {
      const correctImage = summaryCorrectImages[idx];
      if (isCorrectImageDimension(correctImage)) {
        const { url = "" } = record;
        (record as RedditTelegram).correctImageDimension = (
          correctImage as unknown as CorrectImageDimension
        )[url];
        acc.push(record as RedditTelegram);
      }
      return acc;
    }, []);
    return re;
  }

  /**
   * Получает новые видеозаписи reddit
   */
  getNewVideoRecords = async (name: string, limit = 20) => {
    const recordsReddit = await this.requestNewEntries({ name, limit });
    let promises = recordsReddit.reduce(this.getVideoUrl, []);
    const arrayRedditMedia = await Promise.all(promises);
    const workRecords = arrayRedditMedia.filter((i) => i !== null && i.url);
    return workRecords;
  };

  /**
   * Выдаёт массив промисов для получения информации о видео
   * @param {Array} listPromises
   * @param {Object} record Запись из reddit
   * @param {string} record.url Ссылка на видео
   * @param {string} record.title Название видео
   * @param {Object} record.media Скомбинированная инфа о видео
   * @return {Promise<Array>} videoRecords
   */
  private getVideoUrl = (
    listPromises: Promise<Partial<RedditTelegram> | null>[],
    record: Partial<Submission>
  ) => {
    const { url = "", title = "", media, preview } = record;
    // Это gifv?
    if (!!url.match(/.(gifv)$/i)) {
      listPromises.push(this.getGifvVideo(record));
      return listPromises;
    }
    // В остальных случаях должен быть объект media
    if (!media) {
      return listPromises;
    }
    // Это видео типа redgifs.com?
    const { type = "" } = media;
    if (type === "redgifs.com") {
      const recordUrl = this.parseRedgifsUrl(record) || "";
      // Удалось получить ссылку на mp4?
      if (recordUrl.endsWith(".mp4")) {
        listPromises.push(
          new Promise((resolve) => resolve({ title, url: recordUrl }))
        );
        return listPromises;
      }
      // Если есть ссылка, то распарсить из неё video
      if (recordUrl) {
        listPromises.push(this.getVideoFromHtml(recordUrl, title));
      }
      return listPromises;
    }
    // Это обычное видео?
    const fallbackUrl = media?.reddit_video?.fallback_url;
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
   * Разобрать адрес из записи или media
   */
  private parseRedgifsUrl(record: Partial<Submission>) {
    const { media } = record;
    // Если пустое media, значит url отправить
    if (media === null) {
      return record.url;
    }
    if ("media" in record) {
      // Порядок парсинга урла такой: сперва thumbnail_url, затем html
      const thumbnailUrl = media?.oembed?.thumbnail_url || "";
      // Если есть thumbnailUrl, то разобрать его
      if (thumbnailUrl) {
        // Изменить расширение у превью на .mp4
        return thumbnailUrl.substr(0, thumbnailUrl.lastIndexOf(".")) + ".mp4";
      }
      // Если есть html, то его разобрать
      const html = media?.oembed?.html || "";
      if (html) {
        const iframe = parse(html).querySelector("iframe");
        if (iframe) {
          return iframe.getAttribute("src") || "";
        }
      }
    }
    return record.url || "";
  }

  /**
   * Подготовка изображений для отправки в телеграм
   */
  mapRedditForTelegram = (reddit: RedditTelegram) => {
    const re = {
      media: reddit.url,
      caption: reddit.title,
      type: reddit.is_video ? "video" : "photo",
    } as InputMediaPhoto;
    return re;
  };

  private getGifvVideo = ({
    url = "",
    title,
    preview,
  }: Partial<Submission>) => {
    return new Promise<Partial<Submission>>((resolve) =>
      resolve({
        url: url.replace(".gifv", ".mp4"),
        title,
        preview,
      })
    );
  };

  /**
   * Получить html-страницу и взять из неё исходник видеозаписи
   */
  private getVideoFromHtml = (url: string, title: string) => {
    return new Promise<Partial<Submission> | null>((resolve) =>
      fetch(url).then((response) =>
        response.text().then((htmlContent) => {
          const root = parse(htmlContent);
          const source = root.querySelector("video>source");
          if (source !== null) {
            const { src, type } = source.rawAttributes;
            if (type === "video/mp4") {
              resolve({ url: src, title });
            }
          }
          resolve(null);
        })
      )
    );
  };

  /**
   * Подготовка видео для отправки в телеграм
   */
  prepareVideoForTelegram(videoData: string | ArrayLike<number>) {
    if (typeof videoData === "string") {
      return videoData;
    }
    const personUint8Array = Uint8Array.from(videoData);
    const buffer = Buffer.from(personUint8Array);
    return buffer as unknown as string;
  }
}

export default Reddit;
