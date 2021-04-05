const TelegramBot = require("node-telegram-bot-api");

const getChatForMailing = require("../lib/getChatForMailing");
const getNewRecords = require("../lib/reddit");
const { getPartsMessage } = require("../lib/reddit");
const sendFridayContent = require("../lib/sendFridayContent");

/**
 * Отправка пятничного содержимого
 * @param {TelegramBot} bot
 * @param {records} Array заготовленные данные
 * @returns {Promise}
 */
const sendFriday = (bot, records) => {
  const prChatIds = getChatForMailing(bot);
  const prFridayMessages = !records.length
    ? getNewRecords()
    : new Promise((resolve, reject) => resolve(records));
  return Promise.all([prChatIds, prFridayMessages])
    .then(([chatIds, records]) => {
      const fridayMessages = getPartsMessage(records);
      // Защититься от повторного запроса
      const arrayIds = Array.from(new Set(chatIds));
      const promises = arrayIds.map((chatId) =>
        sendFridayContent({ chatId, bot, fridayMessages })
      );
      return Promise.all(promises);
    })
    .catch((err) => console.error(err));
};

module.exports = sendFriday;
