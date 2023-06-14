import mongoose, { Document, Schema } from "mongoose";

export interface NoteDocument extends Document {
  content: string;
  userId: string;
}

const noteSchema = new Schema({
  content: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Note = mongoose.model<NoteDocument>("Note", noteSchema);
