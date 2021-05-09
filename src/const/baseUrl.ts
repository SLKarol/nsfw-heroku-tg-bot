const production = "https://nfsw-telegram-bot.herokuapp.com";
const development = "http://localhost:3000";
const BASE_URL = process.env.NODE_ENV ? production : development;
export default BASE_URL;
