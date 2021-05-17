import { createContext, useContext } from "react";
import { makeAutoObservable, flowResult } from "mobx";

import { NSFWChannel } from "../types/nsfw";

import { getListChannels } from "../lib/nsfw";
import { ClickHandler, EmptyFunction } from "../types/functions";
import { StateResponse } from "../types/common";
import { isError, ResponseError } from "../lib/responseError";

type TypesOperation = "view" | "edit" | "add" | "delete" | "refresh";
type ResponseCrUp = {
  id: string;
};

export class ChannelsStore {
  list: NSFWChannel[] = [];
  state: StateResponse = "done";
  onLoadChannels?: EmptyFunction;
  /** Вид действия с данными*/
  operation: TypesOperation = "view";
  /** ID Выбранного канала */
  selectedChannel: string;
  error: string;

  constructor(onLoadChannels?: EmptyFunction) {
    this.onLoadChannels = onLoadChannels;
    this.selectedChannel = "";
    this.error = "";
    this.handleSaveChannel = this.handleSaveChannel.bind(this);
    this.handleDeleteChannel = this.handleDeleteChannel.bind(this);
    this.loadList = this.loadList.bind(this);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * Загрузка списка каналов
   */
  *loadList() {
    this.state = "pending";
    const channels: NSFWChannel[] = yield getListChannels();
    this.state = "done";
    this.list = channels;
    if (this.onLoadChannels) {
      this.onLoadChannels();
    }
  }

  /**
   * Задать вид операции
   */
  setOperation = (operation: TypesOperation) => {
    this.operation = operation;
  };

  /**
   * Возвращает выбранную запись (или- новую, если не выбрано)
   */
  get selectedRecord(): NSFWChannel {
    const emptyRecord = {
      _id: "",
      name: "",
      withVideo: false,
      moderationRequired: false,
    };
    if (!this.selectedChannel) return emptyRecord;
    const re = this.list.find((c) => c._id === this.selectedChannel);
    return re || emptyRecord;
  }

  /**
   * Нажатие на кнопку в тулбаре
   */
  onClickControlButton: ClickHandler = (event) => {
    const buttonName = (event.currentTarget as HTMLButtonElement)
      .name as TypesOperation;
    if (buttonName === "refresh") {
      return flowResult(this.loadList());
    }
    if (buttonName === "add") {
      this.selectedChannel = "";
      return this.setOperation("add");
    }
    if (buttonName === "edit" || buttonName === "delete") {
      this.selectedChannel =
        (event.currentTarget as HTMLButtonElement).dataset.id || "";
      this.operation = buttonName;
    }
  };

  /**
   * Обработчик сохранения канала
   */
  *handleSaveChannel(
    name: string,
    withVideo: boolean,
    moderationRequired: boolean
  ) {
    const { operation: currentOperation } = this;
    this.operation = "view";
    this.state = "pending";
    const token = localStorage.getItem("token");
    let method = "POST";
    let restUrl = "/api/botFriday/channels";
    if (currentOperation === "edit") {
      method = "PUT";
      restUrl += `/${this.selectedChannel}`;
    }
    if (currentOperation === "delete") {
      method = "DELETE";
      restUrl += `/${this.selectedChannel}`;
    }
    try {
      let response: Response = yield fetch(restUrl, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, withVideo, moderationRequired }),
      });
      const data: ResponseCrUp = yield response.json();
      if (isError(data)) {
        return this.analyzeError(data as ResponseError);
      }
      this.state = "done";
      this.error = "";
      // В зависимости от вида операции выбор того, что делать дальше
      if (currentOperation === "add") {
        return this.addChannel({
          _id: data.id,
          name,
          withVideo,
          moderationRequired,
        });
      }
      if (currentOperation === "edit") {
        return this.updateChannel({
          _id: this.selectedChannel,
          name,
          withVideo,
          moderationRequired,
        });
      }
      if (currentOperation === "delete") {
        return this.deleteChannel(this.selectedChannel);
      }
    } catch (err) {
      //! Описать ошибку
    }
  }

  /**
   * Обработчик сохранения канала
   */
  *handleDeleteChannel() {
    this.state = "pending";
    const token = localStorage.getItem("token");
    try {
      let response: Response = yield fetch(
        `/api/botFriday/channels/${this.selectedChannel}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data: ResponseCrUp = yield response.json();
      if (isError(data)) {
        return this.analyzeError(data as ResponseError);
      }
      this.state = "done";
      this.error = "";
      this.deleteChannel(this.selectedChannel);
      this.operation = "view";
    } catch (err) {
      //! Описать ошибку
    }
  }

  /**
   * Человеческое описание статуса
   */
  get stateName() {
    if (this.state === "pending") {
      return "Ждите...";
    }
    if (this.state === "error") {
      return "Ошибка при выполнении";
    }
    if (this.state === "success") {
      return "Операция выполнена";
    }
    return "";
  }

  /**
   * Форма доступна?
   */
  get disabledForm() {
    return this.state === "pending";
  }

  /**
   * Записать описание ошибки в this.error
   */
  analyzeError(data: ResponseError) {
    this.state = "error";
    this.error = data.validationErrors[0].msg;
  }

  /**
   * Добавляет запись в список каналов
   */
  private addChannel(newChannel: NSFWChannel) {
    this.list.push(newChannel);
    this.sortList();
  }

  /**
   * Обновить запись
   */
  private updateChannel(newChannel: NSFWChannel) {
    const idx = this.list.findIndex((c) => c._id === newChannel._id || "");
    if (idx > -1) {
      this.list[idx] = newChannel;
      this.sortList();
    }
  }

  /**
   * Отсортировать список каналов
   */
  private sortList() {
    this.list.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Найти канал по ID и удалить его
   */
  private deleteChannel(id: string) {
    const idx = this.list.findIndex((c) => c._id === this.selectedChannel);
    if (idx > -1) {
      this.list.splice(idx, 1);
    }
  }
}

export const createStore = () => {
  const channelStore = new ChannelsStore();
  return channelStore;
};
export const ChannelsStoreContext = createContext<ChannelsStore>(
  {} as ChannelsStore
);
export const useChannelStore = () => {
  return useContext(ChannelsStoreContext);
};
