import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { NotesTodoGenerator } from "./controllers/NotesTodoGenerator";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

class App {
  private app: Application;
  private noteTodoGenerator: NotesTodoGenerator;

  constructor() {
    this.app = express();
    this.config();
    this.noteTodoGenerator = new NotesTodoGenerator();
    this.routes();
    this.connectToDatabase();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.post(
      "/generatetodo",
      this.noteTodoGenerator.authenticate,
      this.noteTodoGenerator.index
    );
  }

  private connectToDatabase(): void {
    const uri = "mongodb://localhost:27017/notes";
    mongoose
      .connect(uri)
      .then(() => console.log("Connected to MongoDB"))
      .catch((error) => console.error("Failed to connect to MongoDB:", error));
  }

  public start(): void {
    const port = 8000;
    this.app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
}

const app = new App();
app.start();
