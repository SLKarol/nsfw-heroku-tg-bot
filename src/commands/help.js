const TelegramBot = require("node-telegram-bot-api");

const COMMANDS = require("../const/commands");

/**
 * Генератор содержимого команды help
 * @param {string|number} chatId
 * @param {TelegramBot} bot
 */
const help = (chatId, bot) => {
  let helpText = `Телеграм-бот, созданный для развлечения, а не для работы.\n*Доступные команды:*\n`;
  helpText += COMMANDS.map(
    (command) => `*/${command.command}* ${command.description}`
  ).join(`\n`);
  return bot.sendMessage(chatId, helpText, {
    parse_mode: "Markdown",
  });
};

module.exports = help;
