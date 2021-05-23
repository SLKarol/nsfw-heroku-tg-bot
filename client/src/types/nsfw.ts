import { TChannel } from "../../../src/types/channel";
import { RedditTelegram } from "../../../src/types/reddit";

export type TypeNSFW = "video" | "photo";

export interface NSFWChannel extends TChannel {
  _id: string;
}

export type ResponseListRecords = {
  records: RedditTelegram[];
  callbackMapname: string;
};
