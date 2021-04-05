const path = require("path");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const asyncHandler = require("express-async-handler");

const PORT = process.env.PORT || 5000;
const botFridayRoutes = require("./src/routes/botFriday");
const authMiddleware = require("./src/middleware/auth");
const authRoutes = require("./src/routes/auth");
const getBashContent = require("./src/controllers/bash");
const isFriDay = require("./src/lib/isFriDay");

const app = express();
// CORS
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Звено для авторизации
app.use(authMiddleware);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

app.use("/api/botFriday", botFridayRoutes);
app.use("/api/auth", authRoutes);
app.post("/api/bashOrgs", getBashContent);

/**
 * Сегодня пятница или праздничный день?
 */
app.post(
  "/api/isFriday",
  asyncHandler(async (req, res) => {
    const checkDay = await isFriDay();
    return res.status(200).json({ isFriday: checkDay });
  })
);

// Error handling
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    // Send the error rather than to show it on the console
    res.status(401).send(err);
  } else {
    next(err);
  }
});

app.listen(PORT, () => console.log("Server is running..."));
