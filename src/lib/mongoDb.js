const { MongoClient, Db } = require("mongodb");
require("dotenv").config();

var _connection;
var _db;

/**
 * Закрыть подключение к БД
 * @returns {Promise<void>}
 */
const closeConnection = () => _connection.close();

/**
 * Получить подключение к БД
 * @param {string} databaseName Имя БД, к которой будет подключение
 * @returns {Promise<Db>} mongo Db instance
 */
const getDbConnection = async (databaseName = "mongo2") => {
  if (_db) {
    return _db;
  }
  const mongoClient = new MongoClient(process.env.MONGO_CONNECT_URI, {
    bufferCommands: false,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  _connection = await mongoClient.connect();
  _db = _connection.db(databaseName);
  return _db;
};

module.exports = { getDbConnection, closeConnection };
