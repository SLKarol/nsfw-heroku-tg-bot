import { createContext, useContext } from "react";
import { makeAutoObservable } from "mobx";

export class CrUpChannelStore {
  name: string;
  withVideo: boolean;
  moderationRequired: boolean;

  constructor(name: string, withVideo: boolean, moderationRequired: boolean) {
    this.name = name;
    this.withVideo = withVideo;
    this.moderationRequired = moderationRequired;
    makeAutoObservable(this);
  }
  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    const name = currentTarget.name;
    if (name === "name") {
      return (this.name = currentTarget.value);
    }
    if (name === "moderationRequired") {
      return (this.moderationRequired = currentTarget.checked);
    }
    if (name === "withVideo") {
      return (this.withVideo = currentTarget.checked);
    }
  };

  get disabledForm() {
    return !this.name;
  }
}

export const createStore = (
  name: string,
  withVideo: boolean,
  moderationRequired: boolean
) => {
  const formStore = new CrUpChannelStore(name, withVideo, moderationRequired);
  return formStore;
};
export const FormStoreContext = createContext<CrUpChannelStore>(
  {} as CrUpChannelStore
);

export const useFormStore = () => {
  return useContext(FormStoreContext);
};
