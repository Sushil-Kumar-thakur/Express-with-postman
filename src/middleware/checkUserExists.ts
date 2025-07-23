// src/middleware/checkUserExists.ts
import fs from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";

const dataPath = path.join("users.json");

interface User {
  name: string;
  password:number; 
}

const loadUsers = async (): Promise<User[]> => {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

// ✅ Named export with proper types
export const checkUserExists = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
  try {
    const { name , password } = req.body;
    const users = await loadUsers();

    const userExists = users.some((u) => u.name === name);

    if (userExists) {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    if (!name || !password) {
      res.status(400).json({ error:  "Name and password are required" });
      }
      //  check user name is already in use
      // if (users.some((u) => u.name === name)) {
      //   res.status(409).json({ error: "User name  already exists" });
        
      //   }

    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
