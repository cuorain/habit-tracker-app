require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const authRoutes = require("./routes/auth");
const { sequelize } = require("./models");

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Habit Tracker Backend API is running!");
});
app.use("/api/v1/auth", authRoutes);

// Sync Sequelize models and start the server
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
