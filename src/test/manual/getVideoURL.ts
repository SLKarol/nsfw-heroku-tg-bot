import Reddit from "../../lib/reddit";

import { givfAsGif } from "../mocData/redditRecords";

/**
 * Проверить работу парсинга видео
 */
async function test() {
  const reddit = new Reddit();
  // return await reddit.getNewVideoRecords({ name: "CuteTitties" });
  const promises = await Promise.all(reddit.__getVideoUrl([], givfAsGif));
  console.log("promises :>> ", promises);
  return promises;
}

test().then((re) => console.log(re));
