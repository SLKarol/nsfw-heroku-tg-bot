/**
 * Установить задержку, вернуть промис
 */
function delay(ms = 700) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

module.exports = delay;
