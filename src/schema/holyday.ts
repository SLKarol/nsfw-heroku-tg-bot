import { Schema, Document } from "mongoose";

export interface IHolyday extends Document {
  month: number;
  day: number;
  holidays: string[];
}

export const HolydaySchema = new Schema({
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

export default HolydaySchema;
