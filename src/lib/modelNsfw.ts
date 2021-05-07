import { IChannel } from "../schema/channel";

import { getDbConnection } from "./mongoDb";

/**
 * Работа с БД для nsfw
 */
class ModelNsfw {
  /**
   * Возвращает список каналов
   * @param {boolean} [withVideo=false] - Выдать только видео-каналы? Если true, то выдать все каналы
   */
  async getListChannels(withVideo = false) {
    const filter = withVideo
      ? { withVideo: true }
      : { $or: [{ withVideo: true }, { withVideo: false }] };
    const db = await getDbConnection();
    const channels = db
      .collection<IChannel>("nsfwChannels")
      .find(filter)
      .sort({ withVideo: 1, name: 1 });
    const re = await channels.toArray();
    return re;
  }

  /**
   * Проверка корректности названия канала
   * @param {string} channelName Название канала
   * @returns {Promise<boolean>} Название есть в списке каналов?
   */
  async checkCorrectChannel(channelName = "") {
    if (!channelName) {
      return false;
    }
    const filter = {
      name: { $regex: new RegExp("^" + channelName.toLowerCase(), "i") },
    };
    const db = await getDbConnection();
    const channel = await db.collection("nsfwChannels").findOne(filter);
    return channel ? true : false;
  }

  /**
   * Получить случайный канал
   * @returns {Promise<Object>}
   */
  async getRandomChannel() {
    const db = await getDbConnection();
    const channels = await db
      .collection("nsfwChannels")
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
    return channels[0];
  }
}

export default ModelNsfw;
