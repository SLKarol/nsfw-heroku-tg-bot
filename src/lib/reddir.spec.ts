import assert from "assert";

import Reddit from "./reddit";
import {
  gifvRecord,
  pictureRecord,
  mp4Record,
} from "../../test/mocData/redditRecords";

const reddit = new Reddit();

describe("Проверка класса lib/reddit", () => {
  describe("Метод __getVideoUrl", () => {
    it("Картинки пропускаются", async () => {
      const promisesResult = await reddit.__getVideoUrl([], pictureRecord);
      assert.strictEqual(promisesResult.length, 0);
    });
    it("Успешная обработка gifv", async () => {
      const promises = await Promise.all(reddit.__getVideoUrl([], gifvRecord));
      assert.strictEqual(promises.length, 1);
      const result = promises[0];
      assert.deepStrictEqual(result, {
        url: "https://i.imgur.com/Xsz22CR.mp4",
        caption: "Bouncing Out of Her Bra",
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
        caption: "Nice",
        preview: undefined,
      });
    });
  });
});
