import mysql from "mysql";

async function connectDB() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "mydb"
    });
    console.log("✅ Connected to database");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

connectDB();
