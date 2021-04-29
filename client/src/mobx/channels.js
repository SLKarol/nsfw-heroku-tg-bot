import { createContext, useContext } from "react";
import { makeAutoObservable, runInAction } from "mobx";

export class ChannelsStore {
  list = [];
  state = "done;";

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  /**
   * Загрузка списка каналов
   */
  loadList = async () => {
    const token = localStorage.getItem("token");

    this.state = "pending";
    const response = await fetch("/api/botFriday/listChannels", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    const { channels } = result;
    runInAction(() => {
      this.state = "done";
      this.list = channels;
      const value = channels.length ? channels[0]._id : "";
      this.rootStore.handleChangeFilter({
        target: { value, name: "selectedChannel" },
      });
    });
  };
}

export const createStore = () => {
  const channelStore = new ChannelsStore();
  return channelStore;
};
export const ChannelsStoreContext = createContext({});

export const useChannelStore = () => {
  return useContext(ChannelsStoreContext);
};
