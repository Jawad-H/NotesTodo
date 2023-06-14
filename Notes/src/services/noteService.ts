import { Note, NoteDocument } from '../models/note';

export class NoteService {
  public async getAllNotes(): Promise<NoteDocument[]> {
    return Note.find({});
  }

  public async getNoteById(id: string): Promise<NoteDocument | null> {
    return Note.findById(id);
  }

  public async createNote(noteData: Partial<NoteDocument>): Promise<NoteDocument> {
    const newNote = new Note(noteData);
    return newNote.save();
  }

  public async updateNoteById(id: string, noteData: Partial<NoteDocument>): Promise<NoteDocument | null> {
    return Note.findByIdAndUpdate(id, noteData, { new: true });
  }

  public async deleteNoteById(id: string): Promise<NoteDocument | null> {
    return Note.findByIdAndDelete(id);
  }
}
