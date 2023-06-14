import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
  private jwtSecret: string = process.env.JWT_SECRET;

  public generateToken(data: any): string {
    return jwt.sign(data, this.jwtSecret, { expiresIn: "1h" });
  }

  public verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: UserDocument = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();

      res.json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const token: any = this.generateToken({ userId: user._id });

      res.cookie("token", token, { httpOnly: true });

      res.json({ message: "User logged in successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
