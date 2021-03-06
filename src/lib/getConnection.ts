import { createConnection, Connection } from "mongoose";
import * as dotenv from "dotenv";

import { SubscribeSchema } from "../schema/subscribe";
import { UserSchema } from "../schema/tgUsers";
import HolidaySchema from "../schema/holiday";

dotenv.config();

const MONGO_CONNECT_URI =
  process.env.NODE_ENV !== "development"
    ? process.env.MONGO_CONNECT_URI
    : process.env.MONGO_DEV_CONNECT_URI;

let conn: Connection | null;

/**
 * Возвращает подключение к БД
 * todo Как в DI перенести, чтобы было согласно документации heroku я пока ещё не придумал
 * @return {Promise<Connection>}
 */
const getConnection = async () => {
  if (conn == null) {
    conn = createConnection(MONGO_CONNECT_URI || "");
    await conn;
    conn.model("Subscribes", SubscribeSchema);
    conn.model("TgUsers", UserSchema);
    conn.model("Holidays", HolidaySchema);
  }
  return conn;
};

export default getConnection;
