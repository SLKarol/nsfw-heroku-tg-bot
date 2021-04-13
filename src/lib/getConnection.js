const mongoose = require("mongoose");

const watchSchema = require("../schema/watch.js");
const subscribeSchema = require("../schema/subscribe.js");
const usersSchema = require("../schema/tgUsers");

let conn = null;

/**
 * Возвращает подключение к БД
 * todo Как в DI перенести, чтобы было согласно документации heroku я пока ещё не придумал
 * @return {Promise<mongoose.Connection>}
 */
const getConnection = async () => {
  if (conn == null) {
    conn = mongoose.createConnection(process.env.MONGO_CONNECT_URI, {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await conn;
    conn.model("Watch", watchSchema);
    conn.model("Subscribe", subscribeSchema);
    conn.model("TgUsers", usersSchema);
  }
  return conn;
};

module.exports = getConnection;
