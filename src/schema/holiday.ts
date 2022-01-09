import { Schema, Document } from "mongoose";

export interface IHoliday extends Document {
  month: number;
  day: number;
  holidays: string[];
}

export const HolidaySchema = new Schema({
  month: {
    type: Number,
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  holidays: {
    type: [String],
    required: true,
  },
});

export default HolidaySchema;
