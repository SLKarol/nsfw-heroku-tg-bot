import assert from "assert";

import Reddit from "./reddit";
import {
  gifvRecord,
  pictureRecord,
  mp4Record,
  gifvWithMedia,
  givfAsGif,
} from "../test/mocData/redditRecords";

const reddit = new Reddit();

describe("Проверка класса lib/reddit", () => {
  describe("Метод __getVideoUrl", () => {
    it("Картинки пропускаются", async () => {
      const promisesResult = await Promise.all(
        reddit.__getVideoUrl([], pictureRecord)
      );
      assert.strictEqual(promisesResult.length, 0);
    });
    it("Успешная обработка gifv", async () => {
      const promises = await Promise.all(reddit.__getVideoUrl([], gifvRecord));
      assert.strictEqual(promises.length, 1);
      const result = promises[0];
      assert.deepStrictEqual(result, {
        url: "https://i.imgur.com/Xsz22CR.mp4",
        title: "Bouncing Out of Her Bra",
        preview: undefined,
      });
    });
    it("Успешная обработка mp4", async () => {
      const promises = await Promise.all(reddit.__getVideoUrl([], mp4Record));
      assert.strictEqual(promises.length, 1);
      const result = promises[0];
      assert.deepStrictEqual(result, {
        url: "https://v.redd.it/x6mmhat6/DASH_720.mp4",
        urlAudio: "https://v.redd.it/x6mmhat6/DASH_audio.mp4",
        title: "Nice",
        preview: undefined,
      });
    });
    it("gifv with Media", async () => {
      const promises = await Promise.all(
        reddit.__getVideoUrl([], gifvWithMedia)
      );
      assert.strictEqual(promises.length, 1);
      const result = promises[0];
      assert.deepStrictEqual(result, {
        url: "https://thumbs2.redgifs.com/DisloyalDevotedBrahmancow-mobile.mp4",
        title: "[FFF] Alexis Fawx, Kira Noir, Penny Pax",
        preview: undefined,
      });
    });
    it("gifv не содержит preview, значит вывести null", async () => {
      const promises = await Promise.all(reddit.__getVideoUrl([], givfAsGif));
      assert.strictEqual(promises.length, 1);
      const result = promises[0];
      assert.strictEqual(result, null);
    });
  });
  describe("Метод __parseRedgifsUrl", () => {
    it("Получить URL из url", () => {
      const url = reddit.__parseRedgifsUrl({
        url: "http://127.0.0.1",
        title: "",
      });
      assert.strictEqual(url, "http://127.0.0.1");
    });
    it("Получить URL из media.oembed", () => {
      const url = reddit.__parseRedgifsUrl(gifvWithMedia);
      assert.strictEqual(
        url,
        "https://thumbs2.redgifs.com/DisloyalDevotedBrahmancow-mobile.mp4"
      );
    });
  });
});
