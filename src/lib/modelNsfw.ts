import { ObjectId } from "mongodb";

import { IChannel } from "../schema/channel";
import { TChannel } from "../types/channel";

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
      .sort({ name: 1, withVideo: 1 });
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
   * Получить случайный не модерируемый канал
   * @returns {Promise<IChannel>}
   */
  async getRandomChannel() {
    const db = await getDbConnection();
    const channels = await db
      .collection<IChannel>("nsfwChannels")
      .aggregate([
        { $match: { moderationRequired: true } },
        { $sample: { size: 1 } },
      ])
      .toArray();
    return channels[0];
  }

  /**
   * Добавить новый канал
   * @param channelName Название канала
   */
  async addNewChannel(
    channelName: string,
    withVideo: boolean = false,
    moderationRequired: boolean = false
  ) {
    const db = await getDbConnection();
    return db
      .collection<TChannel>("nsfwChannels")
      .insertOne({ name: channelName, withVideo, moderationRequired });
  }

  /**
   * Обновить запись о канале
   */
  updateChannel(
    id: string,
    name: string,
    withVideo: boolean = false,
    moderationRequired: boolean = false
  ) {
    return getDbConnection().then((db) =>
      db.collection<TChannel>("nsfwChannels").updateOne(
        { _id: new ObjectId(id) }, // Фильтр
        { $set: { name, withVideo, moderationRequired } } // Обновить
      )
    );
  }

  deleteChannel(id: string) {
    return getDbConnection().then((db) =>
      db
        .collection<TChannel>("nsfwChannels")
        .deleteOne({ _id: new ObjectId(id) })
    );
  }
}

export default ModelNsfw;
