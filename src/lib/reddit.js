const { Client } = require("node-reddit-js");
const HTMLParser = require("node-html-parser");
const fetch = require("node-fetch");

require("dotenv").config();

const FORBIDDEN_WORDS = require("../const/forbiddenWords");
const isCorrectImage = require("./isCorrectImage");

/**
 * Получает новые записи NFSW
 * @returns {Promise}
 */
async function getNewRecords(limit = 20) {
  // Настроить клиента
  const client = new Client({
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  });
  const nsfwResponse = await client.reddit.r.nsfw.new.get({ data: { limit } });
  const {
    data: { children },
  } = nsfwResponse;
  const filteredRecords = filterContent(prepareRecords(children));
  const records = await checkCorrectImages(filteredRecords);
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
 * @returns {Array}
 */
function prepareRecords(data) {
  return data.map((record) => {
    const {
      data: { title, url, is_video, media },
    } = record;
    return { title, url, is_video, media };
  });
}

/**
 * Фильтровать по содержимому:
 * По заголовку и по расширению
 * @param {Array} data
 * @returns {Array}
 */
function filterContent(data) {
  const forbiddenWords = FORBIDDEN_WORDS.toLowerCase().split(/[ ,]+/);
  // Отфильтровать
  return data.filter((record) => {
    // Исключить из всего этого видео. Я пока не умею его забирать
    const { media, title, url, is_video } = record;
    const tmpLowerCase = title.toLowerCase();
    const notForbidden = !forbiddenWords.some(
      (word) => tmpLowerCase.indexOf(word) > -1
    );
    return (
      !media &&
      !!url.match(/.(jpg|jpeg|png|gif)$/i) &&
      notForbidden &&
      !is_video
    );
  });
}

/**
 * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
 * @param {Array} records
 * @returns {Promise}
 */
async function checkCorrectImages(records) {
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
const mapRedditForTelegram = (reddit) => ({
  type: reddit.is_video ? "video" : "photo",
  media: reddit.url,
  caption: reddit.title,
});

/**
 * Группировка изображений для создания отправки в телеграмм
 * @param {Array} friDay Массив изображений
 * @returns {Array}
 */
function getPartsMessage(friDay) {
  //массив, в который будет выведен результат.
  let fridayMessages = [];
  const size = 10;
  // Получить массив из частей по size штук
  for (let i = 0; i < Math.ceil(friDay.length / size); i++) {
    fridayMessages[i] = friDay
      .slice(i * size, i * size + size)
      // Подготовить эти 10 записей к отправке в телеграм
      .map(mapRedditForTelegram);
  }
  return fridayMessages;
}

module.exports = getNewRecords;
module.exports.getPartsMessage = getPartsMessage;

/**
 * Получает новые видеозаписи NFSW
 * @returns {Promise<Array>}
 */
async function getNewVideoRecords() {
  // Настроить клиента
  const client = new Client({
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  });
  const nsfwResponse = await client.reddit.r.nsfw.new.get();
  const {
    data: { children },
  } = nsfwResponse;
  const forbiddenWords = FORBIDDEN_WORDS.toLowerCase().split(/[ ,]+/);
  const filtered = children.reduce((acc, record) => {
    const {
      data: { title, url, media },
    } = record;
    const tmpLowerCase = title.toLowerCase();
    const notForbidden = !forbiddenWords.some(
      (word) => tmpLowerCase.indexOf(word) > -1
    );
    if (
      (!!url.match(/.(gifv)$/i) ||
        (media !== null && media?.type === "redgifs.com")) &&
      notForbidden
    ) {
      acc.push({ title, url });
    }
    return acc;
  }, []);
  return filtered;
}
module.exports.getNewVideoRecords = getNewVideoRecords;

/**
 * Получение ссылок видео для рассылки
 * @param {Array} videoRecords
 * @return {Promise<Array>} videoRecords
 */
function expandVideoSrc(videoRecords) {
  const promises = videoRecords.reduce((acc, record) => {
    const { url, title } = record;
    // Обработка формата gifv
    if (!!url.match(/.(gifv)$/i)) {
      acc.push(
        new Promise((resolve) =>
          resolve({ url: url.replace(".gifv", ".mp4"), title })
        )
      );
      return acc;
    }
    acc.push(
      new Promise((resolve) =>
        fetch(record.url).then((response) =>
          response.text().then((htmlContent) => {
            const root = HTMLParser.parse(htmlContent);
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
      )
    );
    return acc;
  }, []);

  return Promise.all(promises)
    .then((urls) => urls.filter((u) => u !== null))
    .catch(() => []);
}

module.exports.expandVideoSrc = expandVideoSrc;
