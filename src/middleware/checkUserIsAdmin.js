// src/middleware/checkUserIsAdmin.js
import fs from "fs/promises";
const dataPath = "./users.json";

const loadUsers = async () => {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

export const checkUserIsAdmin = async (req, res, next) => {
  const name = req.body.name || req.query.name;
  const password = req.body.password || req.query.password;

  if (!name || !password) {
    return res.status(400).json({ error: "Name and password required" });
  }

  try {
    const users = await loadUsers();

    const user = users.find((u) => u.name === name && u.password === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Middleware error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
