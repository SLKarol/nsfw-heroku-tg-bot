const TelegramBot = require("node-telegram-bot-api");

const delay = require("./delay");

/**
 * Рассылка пятничных фото
 * @param {Object} props
 * @param {TelegramBot} props.bot Бот
 * @param {string|number} props.chatId ID чата
 * @param {Array} props.fridayMessages Пятничный контент
 */
const sendFridayContent = ({ chatId, bot, fridayMessages }) => {
  const promises = [];
  for (const group of fridayMessages) {
    let promise;
    if (group.length > 1) {
      promise = bot.sendMediaGroup(chatId, group);
    } else {
      // Если это всего лишь одно фото, то отправить одно фото
      const [photo] = group;
      promise = bot.sendPhoto(chatId, photo.media, {
        disable_notification: true,
        caption: photo.caption,
      });
    }
    promises.push(
      promise
        .then(() => delay(700))
        .catch((err) => console.log("sendFridayContent Error: ", err))
    );
  }
  return Promise.all(promises);
};

module.exports = sendFridayContent;
