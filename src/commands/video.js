const TelegramBot = require("node-telegram-bot-api");

const { getNewVideoRecords, expandVideoSrc } = require("../lib/reddit");
const sendFridayContentVideo = require("../lib/sendFridayContentVideo");

/**
 * Рассылка видеоконтента
 * @param {*} chatId
 * @param {TelegramBot} bot
 */
const video = async (chatId, bot) => {
  bot.sendMessage(chatId, "Поиск видео...");
  return getNewVideoRecords()
    .then((records) => expandVideoSrc(records))
    .then((list) => {
      if (!list.length) {
        return bot.sendMessage(chatId, "Новых видео не найдено.");
      }
      return sendFridayContentVideo({ chatId, bot, list });
    })
    .catch((error) =>
      bot.sendMessage(chatId, `Ошибка в получении видео: ${error}`)
    );
};

module.exports = video;
