import { TChannel } from "./channel";
import { RedditTelegram } from "./reddit";

export type TypeNSFW = "video" | "photo";

export interface NSFWChannel extends TChannel {
  _id: string;
}

export type ResponseListRecords = {
  records: RedditTelegram[];
  callbackMapname: string;
};
