import { RedditMediaTelegram } from "../../../src/types/reddit";
import { NSFWChannel, TypeNSFW } from "../types/nsfw";

import { isResponseError } from "./responseError";

/**
 * Отправка nsfw
 * @returns {Promise}
 */
export async function sendNSFW(type: TypeNSFW) {
  const token = localStorage.getItem("token");
  return fetch("/api/botFriday/sendFriday", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((r) => r.status);
}

/**
 * Получить новые записи
 * @param {number} limit Количество новых записей
 */
export function getNSFW(limit = 20) {
  return fetch("/api/botFriday/getNSFW", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit }),
  }).then((re) => re.json());
}

/**
 * Отправить выбранные пятничные картинки
 * @param {Array} records
 * @returns {Promise}
 */
export function sendFriday(records: RedditMediaTelegram[]) {
  return fetch("/api/botFriday/sendFriday", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records }),
  });
}

export async function getListChannels() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/botFriday/channels", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!isResponseError(result)) {
    const { channels } = result;
    return channels as NSFWChannel[];
  }
  throw result.message;
}
