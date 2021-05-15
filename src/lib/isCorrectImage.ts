import probe from "probe-image-size";

import { CorrectImageDimension } from "../types/reddit";

import {
  IMAGE_SIZE_LIMIT,
  IMAGE_SUM_DIMENSION_LIMIT,
} from "../const/telegramSettings";

/**
 * Изображение годно к отправке в телеграмм?
 * @param {string} url Адрес изображения
 * @returns {boolean} Корректно для отправки
 */
async function isCorrectImage(
  url: string
): Promise<CorrectImageDimension | boolean> {
  let re: CorrectImageDimension | boolean = {
    [url]: false,
  };
  if (!url.match(/.(jpg|jpeg|png|gif)$/i)) return false;
  try {
    const { width, height, length } = await probe(url);
    const sum = width + height;
    if (sum < IMAGE_SUM_DIMENSION_LIMIT && length < IMAGE_SIZE_LIMIT) {
      re[url] = isCorrectRatio(width, height);
    }
  } catch (error) {
    console.error(error);
    re = false;
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
  while (b != 0) {
    let m = a % b;
    a = b;
    b = m;
  }
  return a;
}

export default isCorrectImage;
