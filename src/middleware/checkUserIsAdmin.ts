// src/middleware/checkUserIsAdmin.ts
import fs from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";

const dataPath = path.join("users.json");

interface User {
  name: string;
  password: string;
  role: string;
  [key: string]: any; // allows additional properties
}

const loadUsers = async (): Promise<User[]> => {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

export const checkUserIsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const name: string = req.body.name || req.query.name;
  const password: string = req.body.password || req.query.password;

  if (!name || !password) {
    res.status(400).json({ error: "Name and password required" });
    return;
  }

  try {
    const users = await loadUsers();

    const user = users.find((u) => u.name === name && u.password === password);

    if (!user) {
      res
        .status(401)
        .json({ error: "Only admin authorized – Invalid credentials." });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    // Attach user to request (extend Request type if needed)
    (req as any).user = user;
    next();
  } catch (err: any) {
    console.error("Middleware error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
