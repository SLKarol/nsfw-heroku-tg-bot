import { createContext, useContext } from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { IRedditApiRerod, ResponseListRecords, TypeNSFW } from "../types/nsfw";
import { onChangeCheck, onChangeSelectValue } from "../types/functions";
import { StateResponse } from "../types/common";

import { ChannelsStore } from "../mobx/channels";
import { downloadMedia } from "../lib/media";

//! Исправить на динамичный выбор
type WritableStringKeys = "typeMailing" | "selectedChannel";

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
  recordsToModerate: IRedditApiRerod[] = [];
  /** Статус доступности */
  state: StateResponse = "done";
  /** IDs то есть- urls выбранных записей */
  selectedRecords: string[] = [];
  /** Ошибка работы с api*/
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
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
    this.error = null;
    this.state = "done";
  };

  /**
   * Загрузка модерируемого содержимого
   */
  loadRecords = async () => {
    this.recordsToModerate = [];
    this.state = "pending";
    this.selectedRecords = [];
    const token = localStorage.getItem("token");
    const channel = this.selectedChannelName;

    const params = new URLSearchParams({
      type: this.typeMailing,
      channel,
    });

    const response = await fetch(`/api/botFriday/getContent?${params}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const result = (await response.json()) as ResponseListRecords;
    const { records } = result;
    runInAction(() => {
      this.state = "done";
      this.recordsToModerate = records;
    });
  };

  /**
   * Список материалов для модерации с отметкой на выбранных фото/видео
   */
  get list() {
    const { selectedRecords } = this;
    return this.recordsToModerate.map((record) => ({
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
      return this.__sendSelectedPhoto(records, channelName);
    }
    if (this.countSelected && this.typeMailing === "video") {
      return this.__sendSelectedVideo(records, channelName);
    }
  };

  /**
   * Отправка выбранных фото в телеграмм
   */
  __sendSelectedPhoto = (records: IRedditApiRerod[], name: string) => {
    this.state = "pending";

    fetch("/api/botFriday/sendFriday", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records, name }),
    }).then(this.fetchModerateSuccess, this.fetchModerateFailure);
  };

  /**
   * Отправка выбранных видео в телеграмм
   */
  __sendSelectedVideo = async (records: IRedditApiRerod[], name: string) => {
    this.state = "pending";
    const token = localStorage.getItem("token");
    // Собрать видеозаписи
    //! исправить на allSettled
    const recordsToPublish = await Promise.all(
      records.map(this.__mapVideoForTelegram)
    );
    fetch("/api/botFriday/sendFridayVideo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: recordsToPublish, name }),
    }).then(this.fetchModerateSuccess, this.fetchModerateFailure);
  };

  /**
   * Фильтрация записей для модерации
   * @param {Object} record запись из recordsToModerate
   * @returns {boolean}
   */
  __filterSelectedRecords = (record: IRedditApiRerod) =>
    this.selectedRecords.some((r) => r === record.url);

  fetchModerateSuccess = (response: Response) => {
    this.state = "success";
    response.json().then(this.analyzeResponse);
  };

  fetchModerateFailure = (error: unknown) => {
    this.state = "done";
    this.error = JSON.stringify(error);
  };

  /**
   * Анализ ответа api
   * @param {Object} json
   */
  analyzeResponse = (json: { status: string; error: { message: string } }) => {
    this.state = "error";
    // Найти ответ
    const { status, error } = json;
    if (status === "ok") {
      this.state = "success";
      this.error = null;
      return;
    }
    if (error && typeof error === "object" && "message" in error) {
      this.error = error.message;
      return;
    }
    this.error = JSON.stringify(error);
  };

  /**
   * Подготовка видео к отправке в телеграмм
   * @param {Object} record
   * @returns
   */
  __mapVideoForTelegram = async (record: IRedditApiRerod) => {
    const { title, url = "", urlAudio = "" } = record;
    const baseInfo: {
      is_video: boolean;
      title: string;
      url: string | number[];
    } = {
      is_video: true,
      title,
      url,
    };
    const mediaData = await downloadMedia(url, urlAudio);
    if (mediaData === null) {
      return baseInfo;
    }

    baseInfo.url = typeof mediaData === "string" ? url : Array.from(mediaData);
    return baseInfo;
  };
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
