import { TChannel } from "../../../src/types/channel";
import { IRedditApiRerod } from "../../../src/types/reddit";

export type TypeNSFW = "video" | "photo";

export interface NSFWChannel extends TChannel {
  _id: string;
}

export type ResponseListRecords = {
  records: IRedditApiRerod[];
  callbackMapname: string;
};
