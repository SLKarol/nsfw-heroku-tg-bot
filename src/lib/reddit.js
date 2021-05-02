const { Client } = require("node-reddit-js");
const HTMLParser = require("node-html-parser");
const fetch = require("node-fetch");

require("dotenv").config();

const FORBIDDEN_WORDS = require("../const/forbiddenWords");
const isCorrectImage = require("./isCorrectImage");

class Reddit {
  #config = {
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  };
  #client = null;

  /**
   * Сущность для работы с каналами reddit
   */
  constructor() {
    this.#client = new Client(this.#config);
  }
  /**
   * Получает новые записи NFSW
   * @param {Object} props
   * @param {number} props.limit Максимальное количество фото/видео
   * @param {string} props.name имя канала
   * @param {boolean} props.filterContent - Фильтровать контент?
   * @returns {Promise<Array>}
   */
  async getNewRecords({ limit = 20, name = "nsfw", filterContent = true }) {
    const nsfwResponse = await this.#client
      .reddit(`r/${name.toLowerCase()}`)
      .new.get({
        data: { limit },
      });
    const {
      data: { children },
    } = nsfwResponse;

    const recordsWork = filterContent
      ? this.#filterContent(this.#prepareRecords(children))
      : this.#prepareRecords(children);
    const records = await this.#checkCorrectImages(recordsWork);
    return records.reduce((acc, record) => {
      if (record.correct) {
        acc.push({ title: record.title, url: record.url });
      }
      return acc;
    }, []);
  }

  /**
   * Подготовить массив к обработке - убрать из него лишнюю информацию
   * @param {Array} data
   * @param {boolean} [video=false] - Подготовить для видео?
   * @returns {Array}
   */
  #prepareRecords(data, video = false) {
    return data.map((record) => {
      const {
        data: { title, url, is_video, media, preview },
      } = record;
      const re = { title, url, is_video, media };
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
  #filterContent(data, checkUrlImage = false) {
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
        condition = condition && !!url.match(/.(jpg|jpeg|png|gif)$/i);
      }
      return condition;
    });
  }

  /**
   * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
   * @param {Array} records
   * @returns {Promise}
   */
  async #checkCorrectImages(records) {
    const promises = [];
    for (const record of records) {
      promises.push(
        new Promise((resolve) => {
          const { title, url } = record;
          resolve(
            isCorrectImage(url).then((correct) => ({
              title,
              url,
              correct,
            }))
          );
        })
      );
    }
    return Promise.all(promises);
  }

  /**
   * Подготовка для отправки в телеграм
   */
  mapRedditForTelegram = (reddit) => ({
    type: reddit.is_video ? "video" : "photo",
    media: reddit.url,
    caption: reddit.title,
  });

  /**
   * Подготовка видео для отправки в телеграм
   */
  mapVideoRedditForTelegram = (reddit) => {
    const { url, title } = reddit;
    const re = { type: "video", caption: title, media: url };
    if (typeof url === "string") {
      return re;
    }
    const personUint8Array = Uint8Array.from(url);
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
    const nsfwResponse = await this.#client
      .reddit(`r/${name.toLowerCase()}`)
      .new.get({
        data: { limit },
      });
    const {
      data: { children },
    } = nsfwResponse;
    const recordsWork = filterContent
      ? this.#filterContent(this.#prepareRecords(children, true))
      : this.#prepareRecords(children, true);
    const promises = recordsWork.reduce(this.__getVideoUrl, []);
    const re = await Promise.all(promises);
    return re.filter((i) => i !== null);
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
  __getVideoUrl(listPromises, record) {
    const { url, title, media, preview = undefined } = record;
    // Это gifv?
    if (!!url.match(/.(gifv)$/i)) {
      listPromises.push(
        new Promise((resolve) =>
          resolve({ url: url.replace(".gifv", ".mp4"), title, preview })
        )
      );
      return listPromises;
    }
    // В остальных случаях должен быть объект media
    if (!media) {
      return listPromises;
    }
    // Это видео типа redgifs.com?
    const { type = "" } = media;
    if (type === "redgifs.com") {
      listPromises.push(
        new Promise((resolve) =>
          fetch(record.url).then((response) =>
            response.text().then((htmlContent) => {
              const root = HTMLParser.parse(htmlContent);
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
  }
}
module.exports = Reddit;
