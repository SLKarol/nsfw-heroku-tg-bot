const TelegramBot = require("node-telegram-bot-api");

const getNewRecords = require("../lib/reddit");
const { getPartsMessage } = require("../lib/reddit");
const sendFridayContent = require("../lib/sendFridayContent");

/**
 * Пятничная рассылка
 * @param {string|number} chatId
 * @param {TelegramBot} bot Телеграм-бот
 */
const friday = async (chatId, bot) => {
  await bot.sendMessage(chatId, "Прогони тоску и печаль со своего лица!");
  // Получить все данные для пятничной рассылки
  // const fridayMessages = await
  getNewRecords()
    .then((records) => {
      const fridayMessages = getPartsMessage(records);
      sendFridayContent({ chatId, bot, fridayMessages });
    })
    .catch((err) => console.error(err));
};

module.exports = friday;
