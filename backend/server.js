import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8080;
import authRoutes from "./routes/auth.js";
import db from "./models/index.js";
const { sequelize } = db;

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.get("/", (req, res) => {
  res.send("Habit Tracker Backend API is running!");
});
app.use("/api/v1/auth", authRoutes);

// Sync Sequelize models and start the server
sequelize
  .sync({ force: false })
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      // Only listen if not in test environment
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default app; // Export the app for testing
