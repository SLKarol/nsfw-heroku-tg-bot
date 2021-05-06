import { Schema, Document } from "mongoose";

export interface ISubscribe extends Document {
  chatId: string;
  typeSubscribe: string;
}

export const SubscribeSchema: Schema = new Schema({
  /**
   * Чат, который вызвал это событие
   */
  chatId: {
    type: Number,
    required: true,
  },
  /**
   * Тип наблюдаемого: friday', например
   */
  typeSubscribe: {
    type: String,
    required: true,
  },
});
