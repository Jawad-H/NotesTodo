import { Request, Response, NextFunction } from "express";
import { NoteService } from "../services/noteService";
import jwt from "jsonwebtoken";

export class NoteController {
  private noteService: NoteService;
  private jwtSecret: string = process.env.JWT_SECRET;

  public generateToken(data: any): string {
    return jwt.sign(data, this.jwtSecret, { expiresIn: "1h" });
  }

  public verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  constructor() {
    this.noteService = new NoteService();
  }

  public index = async (req: Request, res: Response): Promise<void> => {
    try {
      const notes = await this.noteService.getAllNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public show = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const note = await this.noteService.getNoteById(id);
      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content } = req.body;
      const newNote = await this.noteService.createNote({
        content: content,
        userId: req["userId"],
      });
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const updatedNote = await this.noteService.updateNoteById(id, {
        content,
      });
      if (!updatedNote) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedNote = await this.noteService.deleteNoteById(id);
      if (!deletedNote) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public authenticate = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.cookies.token;

      if (!token && !req.headers.cookies) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const decoded = this.verifyToken(token ? token : req.headers.cookies);
      req.userId = decoded.userId;
      console.log(req.userId, decoded.userId);
      next();
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}
