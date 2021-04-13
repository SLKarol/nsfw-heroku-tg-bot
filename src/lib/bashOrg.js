const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const TurndownService = require("turndown");

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
        .splice(0, 7)
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
