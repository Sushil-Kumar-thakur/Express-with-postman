// src/middleware/checkUserExists.js
import fs from "fs/promises";
import path from "path";

const dataPath = path.join("users.json");

const loadUsers = async () => {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

// ✅ Named export
export const checkUserExists = async (req, res, next) => {
  try {
    const { name } = req.body;
    const users = await loadUsers();

    const userExists = users.some((u) => u.name === name);

    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    }

    next();
  } catch (err) {
    console.error("Middleware error:", err.message);
    res.status(500).json({ error: "Server error during user check" });
  }
};
