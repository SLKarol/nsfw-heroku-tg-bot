const assert = require("assert");

const Reddit = require("../src/lib/reddit");
const {
  gifvRecord,
  pictureRecord,
  mp4Record,
} = require("./mocData/redditRecords");

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
        title: "Bouncing Out of Her Bra",
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
      });
    });
  });
});
