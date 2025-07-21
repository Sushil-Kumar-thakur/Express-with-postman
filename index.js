import express from "express";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static credentials
const users = [
  { role: "user", username: "user", password: "user123" },
  { role: "admin", username: "admin", password: "admin123" },
];

// POST /login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Redirect based on role
  const dashboardURL = `/dashboard/${foundUser.role}`;
  return res.status(200).json({
    success: true,
    message: `Welcome, ${foundUser.role}!`,
    redirectTo: dashboardURL,
  });
});

// GET dashboard for user
app.get("/dashboard/user", (req, res) => {
  res.send("👤 User Dashboard");
});

// GET dashboard for admin
app.get("/dashboard/admin", (req, res) => {
  res.send("🛠️ Admin Dashboard");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(express.json()); // Middleware to parse JSON

// app.get("/", (req, res) => {
//   res.send("Welcome to Express API");
// });
// app.get("/git", (req, res) => {
//   res.json({
//     success: true,

//     data: {
//       name: "Sushil",
//       email: "sushil@example.com",
//       posts: [
//         { id: 1, title: "Post One" },
//         { id: 2, title: "Post Two" },
//       ],
//     },
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
