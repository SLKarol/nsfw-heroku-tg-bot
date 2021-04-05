const express = require("express");
const asyncHandler = require("express-async-handler");

const bot = require("../bots/bot");
const getChatForMailing = require("../lib/getChatForMailing");
const getNewRecords = require("../lib/reddit");
const sendFriday = require("../shedule/sendFriday");
const sendFridayVideo = require("../shedule/sendFridayVideo");
const { sendBOR } = require("../lib/bashOrg");

const router = express.Router();

router.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

router.post("/sendFriday", (req, res) => {
  const { records = [] } = req.body;
  sendFriday(bot, Array.isArray(records) ? records : [])
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(403));
});

router.post("/sendFridayVideo", (req, res) =>
  sendFridayVideo(bot)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(403))
);

router.post(
  "/sendBOR",
  asyncHandler(async (req, res) => {
    if (!req.isAuth) {
      return res
        .status(401)
        .json({ message: "Ошибка авторизации", success: false });
    }
    const chatIds = await getChatForMailing(bot);
    // Защититься от повторного запроса
    const arrayIds = Array.from(new Set(chatIds));
    const articles = Array.from(req.body);
    const promises = arrayIds.map((chatId) =>
      sendBOR({ chatId, bot, articles })
    );
    Promise.all(promises);
    res.status(200).json({ message: "Отправлено", success: true });
  })
);

router.post(
  "/getNSFW",
  asyncHandler(async (req, res) => {
    const { limit = 20 } = req.body;
    // Определиться с количеством записей
    const count = +limit;
    const records = await getNewRecords(
      count === NaN ? 20 : count > 50 ? 50 : count
    );
    res.status(200).json({ records });
  })
);

module.exports = router;
