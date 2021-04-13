const NodeTelegramBot = require("node-telegram-bot-api");

const ManageSubscribe = require("./manageSubscribe");

const regexUserText = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;

const OPTIONS =
  process.env.NODE_ENV !== "production" ? { polling: true } : undefined;
const FUNNY_REPLY_TEXT =
  "Я пока ничего не понял, но я запишу:|Пристально прищурившись, повторю ещё раз:|Какие мудрые слова:|Бот ничего не ответил, только тихо повторил:|По-медленнее, пожалуйста, я записываю:";

/**
 * Общий класс для телеграм-бота рассылки.
 * Служит базовым классом для ботов.
 * Содержит в себе члены: bot, manageSubscribe.
 * Может сделать подсказку для команд.
 * В метод assignCommands нужно принести список команд и тогда боь научится их выполнять.
 */
class TelegramBot {
  /**
   * Конструктор
   * @param {Object} props
   * @param {string} props.token
   * @param {NodeTelegramBot.BotCommand[]?} props.commands массив команд для построения подсказки
   * @param {string} props.mailingName Название рассылки
   */
  constructor({ token, commands = [], mailingName = "" }) {
    this.bot = new NodeTelegramBot(token, OPTIONS);
    this.manageSubscribe = mailingName
      ? new ManageSubscribe(mailingName)
      : null;
    if (Array.isArray(commands) && commands.length) {
      this.setCommandHelp(commands);
    }
  }

  /**
   * Назначить справку для команд бота
   * @param {NodeTelegramBot.BotCommand[]} listCommand
   */
  setCommandHelp(listCommand) {
    this.bot.setMyCommands(listCommand);
  }

  /**
   * Разбор сообщения на: кманда, бот, аргументы
   * @param {string} text
   * @returns
   */
  #parseUserText(text) {
    const parts = regexUserText.exec(text);
    const command = parts && parts[1];
    const bot = parts && parts[2];
    const commandArgs =
      parts !== null && parts[3]
        ? parts[3].split(/\s+/).filter((arg) => arg.length)
        : [];
    return { text, command, bot, commandArgs };
  }

  /**
   * Назначить команды для бота
   * @param {Array} commands
   */
  assignCommands(commands) {
    this.bot.on("message", (msg) => {
      const {
        text,
        chat: { id: chatId },
      } = msg;
      // Разобрать текст сообщения
      const parsedMessage = this.#parseUserText(text);
      // Обработка команд
      //--- Если ввели обычный текст. Бот его не понимает.
      if (!parsedMessage.command && text) {
        return this.bot.sendMessage(chatId, this.funnyReply(text), {
          parse_mode: "Markdown",
        });
      }
      for (let command of commands) {
        if (parsedMessage.command === command.command) {
          command.handler(chatId, parsedMessage);
          break;
        }
      }
    });
  }

  /**
   * Прикольные варианты ответа
   * @param {string} message
   * @returns {string}
   */
  funnyReply(message) {
    const replies = FUNNY_REPLY_TEXT.split("|");
    const re = replies[Math.floor(Math.random() * replies.length)];
    return `${re}
  _${message}_`;
  }
}
module.exports = TelegramBot;
