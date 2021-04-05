const TelegramBot = require("node-telegram-bot-api");

const getConnection = require("../lib/getConnection");

/**
 *
 * @param {string|number} chatId ID канала
 * @param {TelegramBot} bot Бот
 */
async function quit(chatId, bot) {
  await bot.sendMessage(chatId, "Я ухожу...");
  getConnection()
    .then((conn) => {
      const Subscribe = conn.model("Subscribe");
      return Subscribe.deleteMany({ chatId, typeSubscribe: "friday" });
    })
    .then(() => bot.leaveChat(chatId))
    .catch((e) => {
      console.error(e);
      bot.sendMessage(
        chatId,
        `Произошла ошибка:
${e}`
      );
    });
}

module.exports = quit;
