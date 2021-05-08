import { createContext, useContext } from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { NSFWChannel } from "../types/nsfw";

import { getListChannels } from "../lib/nsfw";
import { EmptyFunction } from "../types/functions";
import { StateResponse } from "../types/common";

export class ChannelsStore {
  // rootStore?: TRootStore;
  list: NSFWChannel[] = [];
  state: StateResponse = "done";
  onLoadChannels?: EmptyFunction;

  constructor(onLoadChannels?: EmptyFunction) {
    this.onLoadChannels = onLoadChannels;
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
      if (this.onLoadChannels) {
        this.onLoadChannels();
      }
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
