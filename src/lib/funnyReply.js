const FUNNY_REPLY_TEXT =
  "Я пока ничего не понял, но я запишу:|Пристально прищурившись, повторю ещё раз:|Какие мудрые слова:|Бот ничего не ответил, только тихо повторил:|По-медленнее, пожалуйста, я записываю:";

/**
 * Генерирует забавный ответ
 */
const funnyReply = (message) => {
  const replies = FUNNY_REPLY_TEXT.split("|");
  const re = replies[Math.floor(Math.random() * replies.length)];
  return `${re}
_${message}_`;
};

module.exports = funnyReply;
