import imageInfo from "./imageInfo";

/**
 * Изображение годно к отправке в телеграмм?
 * @param {string} url Адрес изображения
 * @returns {boolean} Корректно для отправки
 */
async function isCorrectImage(url: string) {
  if (!url.match(/.(jpg|jpeg|png|gif)$/i)) return false;
  let re = false;
  try {
    const { width, height } = await imageInfo(url);
    const sum = width + height;
    // todo
    // Добавить в условие проверку отношения: isCorrectRatio(width, height)
    if (sum < 10000) {
      re = isCorrectRatio(width, height);
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
function calculateRatio(width: number, height: number) {
  const c = gcd(width, height);
  return `${width / c}:${height / c}`;
}

/**
 * Соотношение корректное для отправки в телеграмм?
 * @param {number} width
 * @param {number} height
 * @returns {boolean} Соотношение корректное для отправки в телеграмм?
 */
const isCorrectRatio = (width: number, height: number) =>
  !calculateRatio(width, height)
    .split(":")
    .some((q) => +q >= 20);

function gcd(a: number, b: number) {
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }
  while (b !== 0) {
    let m = a % b;
    a = b;
    b = m;
  }
  return a;
}

export default isCorrectImage;
