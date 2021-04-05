const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;

/**
 * Разбор сообщения на команды
 */
class PartsCommand {
  constructor(text = "") {
    this.text = text;
    const parts = regex.exec(text);
    this.command = parts && parts[1];
    this.bot = parts && parts[2];
    this.commandArgs =
      parts !== null && parts[3]
        ? parts[3].split(/\s+/).filter((arg) => arg.length)
        : [];
  }
}

module.exports = PartsCommand;
