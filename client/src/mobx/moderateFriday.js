// import { URL, URLSearchParams } from "url";
import { createContext, useContext } from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { ChannelsStore } from "mobx/channels";

export class ModerateFridayStore {
  /**
   * Стор списка каналов
   */
  channelsStore;
  /** Тип рассылки
   * @type {string}
   */
  typeMailing = "photo";
  /** Выбранный канал */
  selectedChannel = "";
  /** Записи для модерации */
  recordsToModerate = [];
  /** Статус доступности */
  state = "done;";
  /** ID то есть- url) выбранных записей */
  selectedRecords = [];
  /** Ошибка работы с api*/
  error = null;

  constructor(channelsStore) {
    makeAutoObservable(this);
    this.channelsStore = new ChannelsStore(this);
  }

  /**
   * Изменить значение
   * @param {Object} event
   */
  handleChangeFilter = (event) => {
    const { name, value } = event.target;
    this[name] = value;
    this.recordsToModerate = [];
    this.selectedRecords = [];
    this.error = null;
    this.state = "done";
  };

  /**
   * Загрузка модерируемого содержимого
   */
  loadRecords = async () => {
    const token = localStorage.getItem("token");
    // const url = new URL("/api/botFriday/getContent?");
    const channel = this.selectedChannelName;

    const params = new URLSearchParams({
      type: this.typeMailing,
      channel,
    });

    this.state = "pending";
    const response = await fetch(`/api/botFriday/getContent?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
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
  handleChangeSelect = (event) => {
    const { name, checked } = event.target;
    const selectedSet = new Set(this.selectedRecords);
    if (checked) {
      selectedSet.add(name);
    } else {
      selectedSet.delete(name);
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
    return channel.name;
  }

  /**
   * Количество выбранных записей
   */
  get countSelected() {
    return this.selectedRecords.length;
  }

  /**
   * Отправка фото/видео
   */
  handleSendSelectedRecords = () => {
    const records = this.recordsToModerate.filter(this.__filterSelectedRecords);
    const channelName = this.selectedChannelName;
    if (this.countSelected && this.typeMailing === "photo") {
      this.__sendSelectedPhoto(records, channelName);
    }
  };

  __sendSelectedPhoto = (records, name) => {
    this.state = "pending";
    const token = localStorage.getItem("token");

    fetch("/api/botFriday/sendFriday", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records, name }),
      // body: JSON.stringify({ records: [2128506], name }),
    }).then(this.moderateFetchSuccess, this.moderateFetchFailure);
  };

  /**
   * Фильтрация записей для модерации
   * @param {Object} record запись из recordsToModerate
   * @returns {boolean}
   */
  __filterSelectedRecords = (record) =>
    this.selectedRecords.some((r) => r === record.url);

  moderateFetchSuccess = (response) => {
    response.json().then(this.analyzeResponse);
  };

  moderateFetchFailure = (error) => {
    this.state = "done";
    this.error = JSON.stringify(error);
  };

  /**
   * Анализ ответа api
   * @param {Object} json
   */
  analyzeResponse = (json) => {
    // Найти ответ
    const { status, error = {} } = json;
    if (status === "ok") {
      this.state = "success";
      this.error = null;
      return;
    }
    if (typeof error === "object" && "message" in error) {
      this.state = "error";
      this.error = error.message;
      return;
    }
    this.error = JSON.stringify(error);
  };
}

export const createStore = (channelsStore) => {
  const store = new ModerateFridayStore(channelsStore);
  return store;
};
export const ModerateStoreContext = createContext({});

export const useModerateStore = () => {
  return useContext(ModerateStoreContext);
};
