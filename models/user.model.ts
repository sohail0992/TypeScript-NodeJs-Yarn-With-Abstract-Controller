'use strict';
import mongoose, { Schema } from 'mongoose';
import { UserDTO } from '../dto/user.dto';

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    phone: {
      type: String,
      index: true,
      background: true,
    },
    email: {
      unique: true,
      type: String,
      index: true,
      background: true,
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model<UserDTO>('User', UserSchema);
