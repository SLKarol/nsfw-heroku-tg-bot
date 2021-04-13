const OPTIONS_UPDATE = require("../const/optionsUpdateBD");

const getConnection = require("./getConnection");

/**
 * @class
 * Управление подписками для телеграм-бота
 * Используется БД
 */
class ManageSubscribe {
  #nameSubscribe = "";
  /**
   * Подписка с использованием БД
   * @param {string} nameSubscribe Название подписки
   */
  constructor(nameSubscribe) {
    if (!nameSubscribe) {
      throw new Error("nameSubscribe empty!");
    }
    this.#nameSubscribe = nameSubscribe;
  }

  /**
   * Подписаться на рассылку
   * @param {string|number} chatId
   * @returns {Promise}
   */
  async subscribe(chatId) {
    // todo: Добавить проверку на chatId!==undefined
    const cnn = await getConnection();
    const Subscribe = cnn.model("Subscribe");
    const query = { chatId, typeSubscribe: this.#nameSubscribe };
    return await Subscribe.findOneAndUpdate(query, query, OPTIONS_UPDATE);
  }

  /**
   * Отписаться от рассылки
   * @param {string|number} chatId
   * @returns {Promise}
   */
  async unsubscribe(chatId) {
    // todo: Добавить проверку на chatId!==undefined
    const cnn = await getConnection();
    const Subscribe = cnn.model("Subscribe");
    return await Subscribe.deleteMany({ chatId, typeSubscribe: "friday" });
  }

  /**
   * Возвращает список ID чатов для рассылки
   * @returns {Array<String>} Список ID чатов для рассылки
   */
  async getChatIdsForMailing() {
    const conn = await getConnection();
    const Subscribe = conn.model("Subscribe");
    // Собрать все задания, которые нужно выполнить
    const tasks = await Subscribe.find({
      typeSubscribe: this.#nameSubscribe,
    });
    return tasks.map((t) => t.chatId);
  }
}
module.exports = ManageSubscribe;
