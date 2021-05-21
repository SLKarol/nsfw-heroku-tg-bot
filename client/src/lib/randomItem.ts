/**
 * Случайный элемент из массива
 */
export default function randomItem<T>(list: Array<T>) {
  return list[(list.length * Math.random()) | 0];
}
