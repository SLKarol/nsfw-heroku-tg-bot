const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const watchSchema = new Schema({
  /**
   * Чат, который вызвал это событие
   */
  chatId: {
    type: Number,
    required: true,
  },
  /**
   * Тип наблюдаемого: 'animals'|'friday'
   */
  typeWatch: {
    type: String,
    required: true,
  },
  /**
   * Длительность интервала в ms
   */
  timeoutMS: {
    type: Number,
    required: true,
  },
  /**
   * Расчётное время
   */
  calculateDate: {
    type: String,
    required: true,
  },
});
module.exports = watchSchema;
