import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema({
  username: String,
  password: String,
});

export const User = mongoose.model<UserDocument>('User', userSchema);
