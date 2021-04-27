const COMMANDS = [
  {
    command: "friday",
    description:
      "Показать пятничную подборку. Можно указать канал, откуда брать данные для рассылки",
  },
  {
    command: "video",
    description:
      "Найти и показать видеоконтент. В этой версии будет отправляться без звука.",
  },
  {
    command: "channels",
    description: "Показать список каналов-источников рассылки",
  },
  {
    command: "subscribe",
    description: "Подписаться на рассылки",
  },
  {
    command: "unsubscribe",
    description: "Отписаться от рассылки",
  },
  {
    command: "help",
    description: "Показать справку",
    hint: true,
  },
  {
    command: "quit",
    description: "Отписаться от рассылки, выйти из чата",
  },
];

module.exports = COMMANDS;
