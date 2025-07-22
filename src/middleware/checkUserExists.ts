// src/middleware/checkUserExists.ts
import fs from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";

const dataPath = path.join("users.json");

interface User {
  name: string;
  [key: string]: any; // Allows extra properties
}

const loadUsers = async (): Promise<User[]> => {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

// ✅ Named export with proper types
export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const users = await loadUsers();

    const userExists = users.some((u) => u.name === name);

    if (userExists) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    next();
  } catch (err: any) {
    console.error("Middleware error:", err.message);
    res.status(500).json({ error: "Server error during user check" });
  }
};
