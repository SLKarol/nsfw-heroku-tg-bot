import { Schema, Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  withVideo: boolean;
  moderationRequired: boolean;
}

export const SubscribeSchema: Schema = new Schema({
  /**
   * Название канала в Reddit
   */
  name: {
    type: String,
    required: true,
  },
  /**
   * Этот канал содержит видео?
   */
  withVideo: {
    type: Boolean,
    required: true,
  },

  /**
   * Требуется ли модерация выпусков?
   */
  moderationRequired: {
    type: Boolean,
    required: true,
  },
});
