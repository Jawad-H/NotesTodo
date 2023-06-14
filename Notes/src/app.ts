import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { NoteController } from "./controllers/noteController";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import axios from "axios";
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

class App {
  private app: Application;
  private noteController: NoteController;

  constructor() {
    this.app = express();
    this.config();
    this.noteController = new NoteController();
    this.routes();
    this.connectToDatabase();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }

  private routes(): void {
    this.app.get(
      "/notes",
      this.noteController.authenticate,
      this.noteController.index
    );
    this.app.get(
      "/notes/:id",
      this.noteController.authenticate,
      this.noteController.show
    );
    this.app.post(
      "/notes",
      this.noteController.authenticate,
      this.noteController.create
    );
    this.app.put(
      "/notes/:id",
      this.noteController.authenticate,
      this.noteController.update
    );
    this.app.delete(
      "/notes/:id",
      this.noteController.authenticate,
      this.noteController.delete
    );
  }

  private async internallCallToSaveNotes(
    token: string,
    content: string
  ): Promise<void> {
    try {
      await axios.post(
        "http://localhost:3000/notes",
        {
          content: content,
        },
        {
          headers: {
            cookies: token,
          },
        }
      );
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  }

  private connectToDatabase(): void {
    const uri = "mongodb://localhost:27017/notes";
    mongoose
      .connect(uri)
      .then(() => console.log("Connected to MongoDB"))
      .catch((error) => console.error("Failed to connect to MongoDB:", error));
  }

  public start(): void {
    const consumer = kafka.consumer({ groupId: "topic-test-1-group" });
    consumer.connect();
    consumer.subscribe({ topic: "topic-test-1", fromBeginning: true });

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.internallCallToSaveNotes(
          message.key.toString(),
          message.value.toString()
        );
      },
    });
    const port = 3000;
    this.app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
}

const app = new App();
app.start();
