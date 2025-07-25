import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { checkUserIsAdmin } from "./middleware/checkUserIsAdmin.js";
import { checkUserExists } from "./middleware/checkUserExists.js";

import dotenv from "dotenv";

dotenv.config();

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, "../users.json");

// User Interface
interface User {
  id: number;
  name: string;
  password: string;
  role: string;
}
interface RequestWithUser extends Request {
  user?: User;
}
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Load users from file
const loadUsers = async (): Promise<User[]> => {
  try {
    const data = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error reading users:", err.message);
    } else {
      console.error("❌ Unknown error occurred");
    }
    return [];
  }
};

// Save users to file
const saveUsers = async (users: User[]): Promise<void> => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    console.log("✅ Users saved successfully!");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error reading users:", err.message);
    } else {
      console.error("❌ Unknown error occurred");
    }
  }
};

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Express API with import syntax + login" });
});

// Add new user
app.post("/users", checkUserExists, async (req: Request, res: Response) => {
  try {
    const { name, password, role } = req.body;
    const users = await loadUsers();

    const newUser: User = {
      // id: Date.now(),
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      password,
      role: (role || "USER").toUpperCase(), // 👈 convert to uppercase
    };

    users.push(newUser);
    await saveUsers(users);
    res.status(201).json(newUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error creating user:", err.message);
      res.status(500).json({ message: "Error creating user" });
    } else {
      console.error("❌ Unknown error occurred");
      res.status(500).json({ message: "Error creating user" });
    }
  }
});

// User by ID (GET/PUT/DELETE)
app
  .get("/users/:id", async (req: Request, res: Response) => {
    const users = await loadUsers();
    const user = users.find(
      (u) => u.id == Number(req.params.id) || u.name === req.params.id
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  })
  .put("/users/:id", async (req: Request, res: Response) => {
    const users = await loadUsers();
    const id = parseInt(req.params.id);
    const { name, password, role } = req.body;

    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.password = password || user.password;
    user.role = (role || user.role).toUpperCase(); // 👈 convert to uppercase
    await saveUsers(users);
    res.json(user);
  })
  .delete("/users/:id", async (req: Request, res: Response) => {
    let users = await loadUsers();
    const id = parseInt(req.params.id);

    const exists = users.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "User not found" });

    users = users.filter((u) => u.id !== id);
    await saveUsers(users);
    res.json({ message: `User ${id} deleted` });
  });

// Login route
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const users = await loadUsers();
    const user = users.find((u) => u.name === name && u.password === password);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Only admin authorized – Invalid credentials." });
    }

    res.json({
      message: "Login successful",
      id: user.id,
      role: user.role,
      name: user.name,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Admin dashboard
app.post("/admin", checkUserIsAdmin, (req: RequestWithUser, res: Response) => {
  const admin = req.user; // Optionally type properly
  if (!admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ message: `Welcome to admin ${admin.name} it's your dashboard` });
});

// Admin - view all users
app.get(
  "/admin/users",
  checkUserIsAdmin,
  async (_req: Request, res: Response) => {
    const users = await loadUsers();
    res.json(users);
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
