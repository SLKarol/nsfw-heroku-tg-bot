import { ContentRSS } from "../types/bashOrg";

/**
 * Запрос данных из баш. орг
 * @returns {Promise<Object>}
 */
export function getListBashOrg() {
  return fetch("/api/bashOrg", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json: ContentRSS[]) => json);
}
export async function sendToTelegram(articles: ContentRSS[]) {
  const token = localStorage.getItem("token");
  return fetch("/api/botFriday/sendBOR", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articles),
  })
    .then((res) => res.json())
    .then((json) => json);
}
