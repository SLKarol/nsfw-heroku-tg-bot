const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subscribeSchema = new Schema({
  /**
   * Чат, который вызвал это событие
   */
  chatId: {
    type: Number,
    required: true,
  },
  /**
   * Тип наблюдаемого: friday', например
   */
  typeSubscribe: {
    type: String,
    required: true,
  },
});
module.exports = subscribeSchema;
