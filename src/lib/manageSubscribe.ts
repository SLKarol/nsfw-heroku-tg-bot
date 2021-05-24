import OPTIONS_UPDATE from "../const/optionsUpdateBD";
import { ISubscribe } from "../schema/subscribe";

import getConnection from "./getConnection";

/**
 * @class
 * Управление подписками для телеграм-бота
 * Используется БД
 */
class ManageSubscribe {
  /**
   * Название подписки
   */
  private nameSubscribe: string;
  /**
   * Подписка с использованием БД
   * @param {string} nameSubscribe Название подписки
   */
  constructor(nameSubscribe: string) {
    if (!nameSubscribe) {
      throw new Error("nameSubscribe empty!");
    }
    this.nameSubscribe = nameSubscribe;
  }

  /**
   * Подписаться на рассылку
   * @param {string|number} chatId
   * @returns {Promise}
   */
  async subscribe(chatId: string) {
    const cnn = await getConnection();
    const Subscribe = cnn.model<ISubscribe>("Subscribes");
    const query = { chatId, typeSubscribe: this.nameSubscribe };
    return await Subscribe.findOneAndUpdate(query, query, OPTIONS_UPDATE);
  }

  /**
   * Отписаться от рассылки
   * @param {string|number} chatId
   * @returns {Promise}
   */
  async unsubscribe(chatId: string) {
    const cnn = await getConnection();
    const Subscribe = cnn.model<ISubscribe>("Subscribes");
    return await Subscribe.deleteMany({
      chatId,
      typeSubscribe: this.nameSubscribe,
    });
  }

  /**
   * Возвращает список ID чатов для рассылки
   * @returns {Array<String>} Список ID чатов для рассылки
   */
  async getChatIdsForMailing() {
    const conn = await getConnection();
    const Subscribe = conn.model<ISubscribe>("Subscribes");
    // Собрать все задания, которые нужно выполнить
    const tasks = (await Subscribe.find({
      typeSubscribe: this.nameSubscribe,
    }).distinct("chatId")) as Array<string>;
    return tasks;
  }
}

export default ManageSubscribe;
