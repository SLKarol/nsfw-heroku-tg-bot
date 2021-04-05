require("dotenv").config();

const TOKEN =
  process.env.NODE_ENV !== "development"
    ? process.env.TOKEN
    : process.env.TELEGRAM_TOKEN_DEV;

module.exports = TOKEN || "";
