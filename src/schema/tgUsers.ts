import { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  resetToken: string;
  resetTokenExpiration: Date;
}

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

export default UserSchema;
