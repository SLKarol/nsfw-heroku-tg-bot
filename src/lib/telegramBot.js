const NodeTelegramBot = require("node-telegram-bot-api");

const ManageSubscribe = require("./manageSubscribe");

/**
 * @typedef {Object} ParsedCommandText
 * @property {string} text - Введенный текст
 * @property {string|undefined} command - Введённая команда
 * @property {string|undefined} bot - Бот, к которому обратились
 * @property {Array|undefined} commandArgs - Аргументы к введённой команде
 */

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
 * В метод assignCommands нужно принести список команд и тогда бот научится их выполнять.
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
   * @param {Array} listCommand
   * @returns {Promise<boolean>}
   */
  setCommandHelp(listCommand) {
    return this.bot.setMyCommands(
      listCommand.filter((cmd) => {
        const { hint = false } = cmd;
        return hint;
      })
    );
  }

  /**
   * Разбор сообщения на: команда, бот, аргументы
   * @param {string} text
   * @returns {ParsedCommandText} Разобранный текст
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

  /**
   * Группировка изображений для создания альбомов, пригодных для отправки в телеграм.
   * По сути своей список изображений разбивается на 10 частей, маппится к телеграм-альбому
   * @param {Array} friDay Массив изображений/видео
   * @param {Function} callbackMap Функция-мап, которая преобразует изображения в формат телеграм-медиа
   * @returns {Array} Медиа-альбомы
   */
  createAlbums(friDay, callbackMap) {
    //массив, в который будет выведен результат.
    let fridayMessages = [];
    const size = 10;
    // Получить массив из частей по size штук
    for (let i = 0; i < Math.ceil(friDay.length / size); i++) {
      fridayMessages[i] = friDay.slice(i * size, i * size + size);
      // Подготовить эти 10 записей к отправке в телеграм
      if (callbackMap) {
        fridayMessages[i] = fridayMessages[i].map(callbackMap);
      }
    }
    return fridayMessages;
  }
}
module.exports = TelegramBot;
