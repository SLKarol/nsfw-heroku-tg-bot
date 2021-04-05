const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const TOKEN = require("../const/token.js");
const COMMANDS = require("../const/commands");

const PartsCommand = require("../lib/partsCommand");
const funnyReply = require("../lib/funnyReply");
const friday = require("../commands/friday");
const subscribe = require("../commands/subscribe");
const unsubscribe = require("../commands/unsubscribe");
const quit = require("../commands/quit");
const video = require("../commands/video");
const help = require("../commands/help");

const BASE_URL =
  process.env.APP_URL || "https://nfsw-telegram-bot.herokuapp.com:443";

const options =
  process.env.NODE_ENV !== "production" ? { polling: true } : undefined;
const bot = new TelegramBot(TOKEN, options);
// This informs the Telegram servers of the new webhook.
if (process.env.NODE_ENV === "production") {
  bot.setWebHook(`${BASE_URL}/api/botFriday/webhook`);
}
bot.setMyCommands(COMMANDS);
bot.on("message", (msg) => {
  const {
    text,
    chat: { id: chatId },
  } = msg;
  // Разобрать текст сообщения
  const parsedMessage = new PartsCommand(text);
  // Обработка команд
  //--- Если ввели обычный текст. Бот его не понимает.
  if (!parsedMessage.command && text) {
    return bot.sendMessage(chatId, funnyReply(text), {
      parse_mode: "Markdown",
    });
  }
  //--- Вывести пятничный выпуск
  if (parsedMessage.command === "friday") {
    return friday(chatId, bot);
  }
  //--- Подписаться на рассылки
  if (parsedMessage.command === "subscribe") {
    return subscribe(chatId, bot);
  }
  if (parsedMessage.command === "unsubscribe") {
    return unsubscribe(chatId, bot);
  }
  if (parsedMessage.command === "quit") {
    return quit(chatId, bot);
  }
  if (parsedMessage.command === "video") {
    return video(chatId, bot);
  }
  if (parsedMessage.command === "help") {
    return help(chatId, bot);
  }
  bot.sendMessage(chatId, "Неизвестный запрос");
});

module.exports = bot;
