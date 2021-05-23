import { createContext, useContext } from "react";
import { makeAutoObservable } from "mobx";

import { RedditTelegram } from "../../../src/types/reddit";
import { ResponseListRecords, TypeNSFW } from "../types/nsfw";
import { onChangeCheck, onChangeSelectValue } from "../types/functions";
import { StateResponse } from "../types/common";

import { ChannelsStore } from "../mobx/channels";
import { downloadMedia } from "../lib/media";
import { ResponseError } from "../lib/responseError";
import randomItem from "../lib/randomItem";

//! Исправить на динамичный выбор
type WritableStringKeys = "typeMailing" | "selectedChannel";
interface RecordAsReddit {
  is_video: boolean;
  title: string;
  url: string | number[];
}

export class ModerateFridayStore {
  /**
   * Стор списка каналов
   */
  channelsStore: ChannelsStore;
  /** Тип рассылки */
  typeMailing: TypeNSFW = "photo";
  /** Выбранный канал */
  selectedChannel = "";
  /** Записи для модерации */
  recordsToModerate: RedditTelegram[] = [];
  /** Статус доступности */
  state: StateResponse = "done";
  /** IDs то есть- urls выбранных записей */
  selectedRecords: string[] = [];
  /** Ошибка работы с api*/
  error: string | null = null;
  /** Изображения только корректного формата*/
  onlyCorrectDimensions: boolean = false;

  constructor() {
    this.loadRecords = this.loadRecords.bind(this);
    this.sendSelectedPhoto = this.sendSelectedPhoto.bind(this);
    this.sendSelectedVideo = this.sendSelectedVideo.bind(this);
    this.loadFromRandomChannel = this.loadFromRandomChannel.bind(this);
    makeAutoObservable(this, {}, { autoBind: true });
    this.channelsStore = new ChannelsStore(this.onLoadChannels);
  }

  /**
   * Реакция после загрузки списка каналов
   */
  onLoadChannels = () => {
    const { list } = this.channelsStore;
    const value = list.length ? list[0]._id : "";
    this.handleChangeFilter({
      target: { value, name: "selectedChannel" },
    } as any);
  };

  /**
   * Изменить значение
   * @param {Object} event
   */
  handleChangeFilter: onChangeSelectValue = (event) => {
    const { name = "", value = "" } = event.target;
    this[name as WritableStringKeys] = value as any;
    this.recordsToModerate = [];
    this.selectedRecords = [];
    this.onlyCorrectDimensions = false;
    this.error = null;
    this.state = "done";
  };

  /**
   * Загрузка модерируемого содержимого
   */
  *loadRecords() {
    this.recordsToModerate = [];
    this.onlyCorrectDimensions = false;
    this.selectedRecords = [];
    this.state = "pending";
    const token = localStorage.getItem("token");
    const channel = this.selectedChannelName;
    const params = new URLSearchParams({
      type: this.typeMailing,
      channel,
    });
    try {
      const response: Response = yield fetch(
        `/api/botFriday/content?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result: ResponseListRecords = yield response.json();
      const { records } = result;
      this.recordsToModerate = records;
      this.state = "done";
      return true;
    } catch (err) {
      //! Описать ошибку
      return console.error(err);
    }
  }

  /**
   * Список материалов для модерации с отметкой на выбранных фото/видео
   */
  get list() {
    const { selectedRecords, recordsToModerate, onlyCorrectDimensions } = this;
    const records = onlyCorrectDimensions
      ? recordsToModerate.filter((r) => r.correctImageDimension)
      : recordsToModerate;

    return records.map((record) => ({
      ...record,
      checked: selectedRecords.some((urlChecked) => urlChecked === record.url),
    }));
  }

  /**
   * Обработка выбора картинки/фото
   * @param {Object} event
   */
  handleSelectMaterial: onChangeCheck = (event) => {
    const { name, checked } = event.target;
    const selectedSet = new Set(this.selectedRecords);
    if (checked) {
      selectedSet.add(name || "");
    } else {
      selectedSet.delete(name || "");
    }
    this.selectedRecords = [...selectedSet];
  };

  /**
   * Выбранный канал
   */
  get selectedChannelName() {
    const channel = this.channelsStore.list.find(
      (c) => c._id === this.selectedChannel
    );
    return channel?.name || "";
  }

  /**
   * Количество выбранных записей
   */
  get countSelected() {
    return this.selectedRecords.length;
  }

  /**
   * Приложение занято работой с api
   */
  get appPending() {
    const {
      state,
      channelsStore: { state: channelState },
    } = this;
    return state === "pending" || channelState === "pending";
  }

  /**
   * Отправка фото/видео
   */
  handleSendSelectedRecords = () => {
    const records = this.recordsToModerate.filter(this.__filterSelectedRecords);
    const channelName = this.selectedChannelName;
    if (this.countSelected && this.typeMailing === "photo") {
      return this.sendSelectedPhoto(records, channelName);
    }
    if (this.countSelected && this.typeMailing === "video") {
      return this.sendSelectedVideo(records, channelName);
    }
  };

  /**
   * Отправка выбранных фото в телеграмм
   */
  private *sendSelectedPhoto(records: RedditTelegram[], name: string) {
    this.state = "pending";
    try {
      const response: Response = yield fetch("/api/botFriday/sendFriday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records, channel: name }),
      });
      this.state = "success";
      const data: ResponseError = yield response.json();
      this.analyzeResponse(data);
    } catch (err) {
      this.fetchModerateFailure(err);
    }
  }

  /**
   * Отправка выбранных видео в телеграмм
   */
  private *sendSelectedVideo(records: RedditTelegram[], name: string) {
    this.state = "pending";
    const token = localStorage.getItem("token");
    // Собрать видеозаписи
    try {
      const recordsToPublish: RecordAsReddit[] = yield Promise.all(
        records.map(this.__mapVideoForTelegram)
      );
      const response: Response = yield fetch("/api/botFriday/sendFridayVideo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: recordsToPublish, channel: name }),
      });
      this.state = "success";
      const data: ResponseError = yield response.json();
      this.analyzeResponse(data);
    } catch (err) {
      this.fetchModerateFailure(err);
    }
  }

  /**
   * Фильтрация записей для модерации
   * @param {Object} record запись из recordsToModerate
   * @returns {boolean}
   */
  __filterSelectedRecords = (record: RedditTelegram) =>
    this.selectedRecords.some((r) => r === record.url);

  fetchModerateFailure = (error: unknown) => {
    this.state = "done";
    this.error = JSON.stringify(error);
  };

  /**
   * Анализ ответа api
   * @param {Object} json
   */
  analyzeResponse = (json: ResponseError) => {
    this.state = "error";
    // Найти ответ
    const { message, success } = json;
    if (success) {
      this.state = "success";
      this.error = null;
      return;
    }
    // if (message && typeof message === "object" && "message" in message) {
    //   this.error = message;
    //   return;
    // }
    this.error = JSON.stringify(message);
  };

  /**
   * Подготовка видео к отправке в телеграмм
   */
  __mapVideoForTelegram = (record: RedditTelegram) => {
    const { title = "", url = "", urlAudio = "" } = record;
    const baseInfo: RecordAsReddit = {
      is_video: true,
      title,
      url,
    };
    return downloadMedia(url, urlAudio).then((mediaData) => {
      if (mediaData === null) {
        return baseInfo;
      }
      baseInfo.url =
        typeof mediaData === "string" ? url : Array.from(mediaData);
      return baseInfo;
    });
  };

  /**
   * Сделать выбор корректного изображения недоступным для видео
   */
  get disableToggleCorrectDimensions() {
    return this.typeMailing === "video";
  }
  /**
   * Переключить состояние "Корректные/Любые изображения"
   */
  toggleShowCorrectImages() {
    this.onlyCorrectDimensions = !this.onlyCorrectDimensions;
    this.selectedRecords = [];
  }

  /**
   * Все изображения
   */
  get countAll() {
    return this.list.length;
  }

  *loadFromRandomChannel() {
    // Получить случайный канал
    const { list } = this.channelsStore;
    const channel = randomItem(list);
    this.selectedChannel = channel._id;
    yield this.loadRecords();
  }
}

export const createStore = () => {
  const store = new ModerateFridayStore();
  return store;
};
export const ModerateStoreContext = createContext<ModerateFridayStore>(
  {} as ModerateFridayStore
);

export const useModerateStore = () => {
  return useContext(ModerateStoreContext);
};
