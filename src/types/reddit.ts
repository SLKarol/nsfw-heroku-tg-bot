import { Submission } from "snoowrap";
import { InputMediaPhoto } from "node-telegram-bot-api";

export type CorrectImageDimension = { [key: string]: boolean };

export interface RedditTelegram extends Partial<Submission> {
  correctImageDimension?: boolean;
  urlAudio?: string;
}

export type MapPhotoAlbumFunction = (reddit: RedditTelegram) => InputMediaPhoto;
