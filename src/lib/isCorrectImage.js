const probe = require("probe-image-size");

/**
 * Изображение годно к отправке в телеграмм?
 * @param {string} url Адрес изображения
 * @returns {boolean} Корректно для отправки
 */
async function isCorrectImage(url) {
  let re = false;
  try {
    const { width, height, length } = await probe(url);
    const sum = width + height;
    // todo
    // Добавить в условие проверку отношения: isCorrectRatio(width, height)
    if (sum < 10000 && length < 5e6) {
      re = true;
    }
  } catch (error) {
    console.error(error);
  }
  return re;
}

/**
 * Расчёт соотношений ширины и высоты
 * @param {number} width
 * @param {number} height
 * @returns {string} 4:2 или 4:9 и т.д.
 */
function calculateRatio(width, height) {
  const c = gcd(width, height);
  return `${width / c}:${height / c}`;
}

/**
 * Соотношение корректное для отправки в телеграмм?
 * @param {number} width
 * @param {number} height
 * @returns {boolean} Соотношение корректное для отправки в телеграмм?
 */
const isCorrectRatio = (width, height) =>
  !calculateRatio(width, height)
    .split(":")
    .some((q) => +q >= 20);

function gcd(a, b) {
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }
  while (b != 0) {
    let m = a % b;
    a = b;
    b = m;
  }
  return a;
}

module.exports = isCorrectImage;
