const TelegramBot = require("node-telegram-bot-api");

const getConnection = require("../lib/getConnection");

const OPTIONS_UPDATE = {
  new: true,
  upsert: true,
  setDefaultsOnInsert: true,
};

/**
 *
 * @param {string|number} chatId ID канала
 * @param {TelegramBot} bot Бот
 */
async function subscribe(chatId, bot) {
  await bot.sendMessage(chatId, "Подписаться на рассылку...");
  getConnection()
    .then((conn) => {
      const Subscribe = conn.model("Subscribe");
      const query = { chatId, typeSubscribe: "friday" };
      return Subscribe.findOneAndUpdate(query, query, OPTIONS_UPDATE);
    })
    .then(() => bot.sendMessage(chatId, "Задание принято."))
    .catch((e) => {
      console.error(e);
      bot.sendMessage(
        chatId,
        `Произошла ошибка:
${e}`
      );
    });
}

module.exports = subscribe;
