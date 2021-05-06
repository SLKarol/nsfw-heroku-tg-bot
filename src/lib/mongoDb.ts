import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

var _connection: MongoClient | undefined;
var _db: Db | undefined;

/**
 * Закрыть подключение к БД
 * @returns {Promise<void>}
 */
const closeConnection = (): Promise<void> | undefined => {
  if (_connection) return _connection.close();
};

/**
 * Получить подключение к БД
 * @param {string} databaseName Имя БД, к которой будет подключение
 * @returns {Promise<Db>} mongo Db instance
 */
const getDbConnection = async (databaseName = "mongo2"): Promise<Db> => {
  if (_db) {
    return _db;
  }
  const mongoClient = new MongoClient(process?.env?.MONGO_CONNECT_URI || "", {
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  _connection = await mongoClient.connect();
  _db = _connection.db(databaseName);
  return _db;
};
export { getDbConnection, closeConnection };
