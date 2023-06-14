import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { AuthController } from "./controllers/authController";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

class App {
  private app: Application;
  private authController: AuthController;
  constructor() {
    this.app = express();
    this.config();
    this.authController = new AuthController();
    this.routes();
    this.connectToDatabase();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.post("/register", this.authController.register);
    this.app.post("/login", this.authController.login);
  }

  private connectToDatabase(): void {
    const uri = "mongodb://localhost:27017/notes";
    mongoose
      .connect(uri)
      .then(() => console.log("Connected to MongoDB"))
      .catch((error) => console.error("Failed to connect to MongoDB:", error));
  }

  public start(): void {
    const port = 4000;
    this.app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
}

const app = new App();
app.start();
