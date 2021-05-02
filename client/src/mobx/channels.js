import { createContext, useContext } from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { getListChannels } from "lib/nsfw";

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
    this.state = "pending";
    const channels = await getListChannels();
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
