const TelegramBot = require("node-telegram-bot-api");

const delay = require("./delay");

/**
 *
 * @param {Object} props
 * @param {TelegramBot} props.bot Бот
 * @param {string|number} props.chatId ID чата
 * @param {Array<string>} props.list Массив содержимого
 */
const sendFridayContentVideo = async ({ chatId, bot, list }) => {
  if (!list.length) {
    return process.nextTick();
  }
  return bot.sendMessage(chatId, `Нашлось видео: ${list.length} .`).then(() => {
    const promises = [];
    list.forEach((record) => {
      promises.push(
        bot
          .sendVideo(chatId, record.url, {
            caption: record.title,
            disable_notification: true,
          })
          .then(() => delay())
          .catch((err) => console.error(err))
      );
    });
    return Promise.all(promises);
  });
};

module.exports = sendFridayContentVideo;
