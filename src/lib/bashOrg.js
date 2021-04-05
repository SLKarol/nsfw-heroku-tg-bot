const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const TurndownService = require("turndown");
const TelegramBot = require("node-telegram-bot-api");

const delay = require("./delay");

const turndownService = new TurndownService();

/**
 * Возвращает текст тэга "description" в формате markdown
 * @param {Element} nodeItem
 * @param {string} [tagName=description] название тэга
 * @returns {string}
 */
function getDescriptionToMarkDown(nodeItem, tagName = "description") {
  return turndownService.turndown(
    nodeItem
      .querySelector(tagName)
      .text.replace("<![CDATA[", "")
      .replace("]]>", "")
  );
}

/**
 * Возвращает промис-массив содержимого rss-ленты баш-орга
 * @param {string} rssUrl Адрес
 * @returns {Promise<Array>}
 */
function getListBashOrg(rssUrl = "https://bash.im/rss/") {
  return fetch(rssUrl).then((response) =>
    response.text().then((htmlContent) => {
      const root = HTMLParser.parse(htmlContent);
      return Array.from(root.querySelectorAll("item"))
        .splice(0, 5)
        .map((item) => {
          const content = getDescriptionToMarkDown(item);
          const id = item.querySelector("guid").text;
          const bashContent = {
            content,
            id,
            title: item.querySelector("title").text,
          };
          return bashContent;
        });
    })
  );
}
module.exports = getListBashOrg;

/**
 *
 * @param {Object} props
 * @param {TelegramBot} props.bot Бот
 * @param {string|number} props.chatId ID чата
 * @param {Array} props.articles Массив сообщений
 */
async function sendBOR({ chatId, bot, articles }) {
  const promises = [];
  articles.forEach((article) => {
    promises.push(
      bot
        .sendMessage(
          chatId,
          `*${article.title}*
${article.content}`,
          { parse_mode: "Markdown" }
        )
        .then(() => delay())
        .catch((err) => console.error(err))
    );
    return Promise.all(promises);
  });
}

module.exports.sendBOR = sendBOR;
