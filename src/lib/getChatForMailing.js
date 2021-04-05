const TelegramBot = require("node-telegram-bot-api");

const getConnection = require("../lib/getConnection");

/**
 * Возвращает список ID чатов для рассылки
 * @param {TelegramBot} bot
 * @returns {Array<String>} Список ID чатов для рассылки
 */
const getChatForMailing = async (bot) => {
  const conn = await getConnection();
  const Subscribe = conn.model("Subscribe");
  // Собрать все задания, которые нужно выполнить
  const tasks = await Subscribe.find({
    typeSubscribe: "friday",
  });
  const promiseArray = [];
  for (task of tasks) {
    promiseArray.push(
      canSendMessage(task.chatId, bot).catch(() => ({
        chatId: task.chatId,
        possibleSend: false,
      }))
    );
  }
  return Promise.all(promiseArray)
    .then((chatsInfo) =>
      chatsInfo.reduce((acc, chatInfo) => {
        if (chatInfo.possibleSend) {
          acc.push(chatInfo.chatId);
          return acc;
        }
      }, [])
    )
    .catch(() => []);
};

/**
 * Проверка того, что можно отправить сообщение
 * @param {string | number} chatId ID чата
 * @param {TelegramBot} telegram
 * @returns {Promise<boolean>}
 */
async function canSendMessage(chatId, bot) {
  try {
    const info = await bot.getChat(chatId);
    if (info.permissions) {
      const {
        permissions: { can_send_media_messages = false },
      } = info;
      return { chatId, possibleSend: can_send_media_messages };
    }
    // Если юзер, то он всегда может получать сообщения
    return chatId
      ? { chatId, possibleSend: true }
      : { chatId, possibleSend: false };
  } catch (e) {
    return false;
  }
}

module.exports = getChatForMailing;
