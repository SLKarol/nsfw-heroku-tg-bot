const fetch = require("node-fetch");

/**
 * Сегодня разве пятница или праздник?
 */
module.exports = isFriDay = async () => {
  /** Текущий день */
  const today = new Date();
  /** День недели */
  const currentDay = today.getDay();
  if (currentDay === 5) {
    return true;
  }
  //--- Получить список праздников

  /** Текущий год */
  const year = today.getFullYear();
  const response = await fetch(
    `https://date.nager.at/api/v2/PublicHolidays/${year}/RU`
  );
  /** @type {Array} */
  const data = await response.json();
  /** гггг-мм-дд */
  const sDate = today.toISOString().split("T")[0];
  // Есть праздничный день?
  return data.some((r) => r.date === sDate);
};
