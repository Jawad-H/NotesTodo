import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Configuration, OpenAIApi } from "openai";
const { Kafka } = require("kafkajs");
const configuration = new Configuration({
  apiKey: process.env.Apikey,
});
const openai = new OpenAIApi(configuration);

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});
const producer = kafka.producer();

export class NotesTodoGenerator {
  private jwtSecret: string = process.env.JWT_SECRET;
  public generateToken(data: any): string {
    return jwt.sign(data, this.jwtSecret, { expiresIn: "1h" });
  }

  public verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  public index = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.body.email;

      const userId = req["userId"];
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: [`Create a todo list from the following email:"${email}"`],
        max_tokens: 50,
        temperature: 0.7,
        n: 1,
      });

      await producer.connect();
      await producer.send({
        topic: "topic-test-1",
        messages: [
          {
            key: req.cookies.token,
            value: completion?.data?.choices[0]?.text
              ?.trim()
              .replace(/[\r\n]+/g, ""),
          },
        ],
      });

      res
        .status(200)
        .json(
          completion?.data?.choices[0]?.text?.trim().replace(/[\r\n]+/g, "")
        );
      console.log(completion.data);
    } catch (error: any) {
      console.log(error);
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

      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const decoded: any = this.verifyToken(token);

      req.userId = decoded.userId;

      next();
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}
