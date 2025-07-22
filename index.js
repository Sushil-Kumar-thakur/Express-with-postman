import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { checkUserIsAdmin } from "./src/middleware/checkUserIsAdmin.js";
import { checkUserExists } from "./src/middleware/checkUserExists.js";
import dotenv from "dotenv";
// __dirname workaround for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, "users.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load users from file
const loadUsers = async () => {
  try {
    const data = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error reading users:", err.message);
    return []; // return empty array if file not found or invalid JSON
  }
};

// Save users to file
const saveUsers = async (users) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    console.log("✅ Users saved successfully!");
  } catch (err) {
    console.error("❌ Error saving users:", err.message);
  }
};

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Express API with import syntax + login" });
});

// Get all users
app.get("/users", checkUserIsAdmin, async (req, res) => {
  try {
    const users = await loadUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading users" });
  }
});

// Add new user
app.post("/users", checkUserExists, async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const users = await loadUsers();

    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      password,
      role: role || "USER",
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error saving user:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// user by ID
app
  .get("/users/:id", async (req, res) => {
    const users = await loadUsers();
    const user = users.find(
      (u) => u.id == req.params.id || u.name == req.params.id
    );
    if (!user) return res.status(404).json({ error: "User not found" }); // Get user by ID
    res.json(user);
  })
  .put("/users/:id", async (req, res) => {
    const users = await loadUsers();
    const id = parseInt(req.params.id);
    const { name, password, role } = req.body;

    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found" }); // Update user

    user.name = name || user.name;
    user.password = password || user.password;
    user.role = role || user.role;

    await saveUsers(users);
    res.json(user);
  })
  .delete("/users/:id", async (req, res) => {
    let users = await loadUsers();
    const id = parseInt(req.params.id);

    const exists = users.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "User not found" }); // DELETE user

    users = users.filter((u) => u.id !== id);
    await saveUsers(users);
    res.json({ message: `User ${id} deleted` });
  });

// Login route
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const users = await loadUsers();

    const user = users.find((u) => u.name === name && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      id: user.id,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  admin Access only
// Route 1: Admin Login Check
app.post("/admin", checkUserIsAdmin, (req, res) => {
  res.json({ message: `Welcome to admin  ${req.user.name} your  dashboard` });
});

// Route 2: View All Users (Admin Only)
app.get("/admin/users", checkUserIsAdmin, async (req, res) => {
  const users = await loadUsers();
  res.json(users);
});
// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
