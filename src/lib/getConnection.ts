import { createConnection, Connection } from "mongoose";

import { SubscribeSchema } from "../schema/subscribe";
import { UserSchema } from "../schema/tgUsers";

let conn: Connection | null;

/**
 * Возвращает подключение к БД
 * todo Как в DI перенести, чтобы было согласно документации heroku я пока ещё не придумал
 * @return {Promise<Connection>}
 */
const getConnection = async () => {
  if (conn == null) {
    conn = createConnection(process.env.MONGO_CONNECT_URI || "", {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await conn;
    conn.model("Subscribe", SubscribeSchema);
    conn.model("TgUsers", UserSchema);
  }
  return conn;
};

export default getConnection;
