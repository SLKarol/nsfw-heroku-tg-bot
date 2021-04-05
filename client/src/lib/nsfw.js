/**
 * Отправка nsfw
 * @returns {Promise}
 */
export function sendNSFW(type) {
  const url = type === "photo" ? "sendFriday" : "sendFridayVideo";
  return fetch(`/api/botFriday/${url}`, {
    method: "POST",
    headers: {
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
export function sendFriday(records) {
  return fetch("/api/botFriday/sendFriday", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records }),
  });
}
