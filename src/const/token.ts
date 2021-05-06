import * as dotenv from "dotenv";

dotenv.config();

const TOKEN =
  process.env.NODE_ENV !== "development"
    ? process.env.TOKEN
    : process.env.TELEGRAM_TOKEN_DEV;

export default TOKEN || "";
