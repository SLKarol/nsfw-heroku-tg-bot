import fetch from "node-fetch";

import getConnection from "./getConnection";
import type { IHoliday } from "../schema/holiday";

import randomItem from "./randomItem";

type ResponsePublicHolidays = {
  date: string;
};

/**
 * Сегодня разве пятница или праздник?
 */
export async function isFriDay() {
  /** Текущий день */
  const today = new Date();
  /** День недели */
  const currentDay = today.getDay();
  if (currentDay === 5) {
    return true;
  }

  //--- Получить список официальных праздников
  // через try...catch, если их служба отвалится
  try {
    /** Текущий год */
    const year = today.getFullYear();
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/RU`
    );
    const data = (await response.json()) as ResponsePublicHolidays[];
    /** гггг-мм-дд */
    const sDate = today.toISOString().split("T")[0];
    // Есть праздничный день?
    return data.some((r) => r.date === sDate);
  } catch (e) {
    return false;
  }
}

/**
 * Генерация текста о текущем празднике
 */
export async function getHolidayMessage() {
  const now = new Date();
  const day = now.getDate();
  const month = 1 + now.getMonth();
  try {
    const conn = await getConnection();
    const data = await conn.model<IHoliday>("Holidays").findOne(
      {
        month,
        day,
      },
      {
        holidays: 1,
      }
    );

    if (data && data.holidays.length) {
      return `Я смотрю, вы тут празднуете ${randomItem(data.holidays)}`;
    }
    return "";
  } catch (e) {
    console.error(e);
    return "";
  }
}
