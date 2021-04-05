const TelegramBot = require("node-telegram-bot-api");

const getChatForMailing = require("../lib/getChatForMailing");
const { getNewVideoRecords, expandVideoSrc } = require("../lib/reddit");
const sendFridayContentVideo = require("../lib/sendFridayContentVideo");

/**
 * Отправка пятничного содержимого
 * @param {TelegramBot} bot
 * @returns {Promise}
 */
const sendFridayVideo = async (bot) => {
  const prChatIds = getChatForMailing(bot);
  const prFridayMessages = getNewVideoRecords().then((records) =>
    expandVideoSrc(records)
  );
  return Promise.all([prChatIds, prFridayMessages])
    .then(([chatIds, list]) => {
      // Защититься от повторного запроса
      const arrayIds = Array.from(new Set(chatIds));
      const promises = list.length
        ? arrayIds.map((chatId) =>
            sendFridayContentVideo({ chatId, bot, list })
          )
        : [];
      return Promise.all(promises);
    })
    .catch((err) => console.error(err));
};

module.exports = sendFridayVideo;
