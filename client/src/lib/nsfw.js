/**
 * Отправка nsfw
 * @returns {Promise}
 */
export async function sendNSFW(type) {
  const token = localStorage.getItem("token");
  const url = type === "photo" ? "sendFriday" : "sendFridayVideo";
  const channels = await getListChannels();
  const filteredChannels = channels.filter((ch) => {
    if (type === "video") {
      return ch.withVideo;
    }
    return !ch.withVideo;
  });
  // Найти случайный канал: Сократит время выполнения на сервере.
  const randomChannel =
    filteredChannels[Math.floor(Math.random() * filteredChannels.length)];
  return fetch(`/api/botFriday/${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: randomChannel.name }),
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

export async function getListChannels() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/botFriday/listChannels", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  const { channels } = result;
  return channels;
}
