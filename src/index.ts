import path from "path";
import express from "express";
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import cors from "cors";
import * as dotenv from "dotenv";

import Reddit from "./lib/reddit";
import NSFWBot from "./bots/NSFWBot";
import FridayRouter from "./routes/fridayRouter";
import ModelNsfw from "./lib/modelNsfw";
import authMiddleware from "./middleware/auth";
import authRoutes from "./routes/auth";
import getBashContent from "./controllers/bash";
import FridayController from "./controllers/friday";
import filesRoutes from "./routes/files"; //--- В разработке

dotenv.config();
const PORT = process.env.PORT || 5000;
const TOKEN =
  process.env.NODE_ENV !== "development"
    ? process.env.TOKEN
    : process.env.TELEGRAM_TOKEN_DEV;

const app = express();
const db = new ModelNsfw();
const reddit = new Reddit();
const nsfwBot = new NSFWBot("" + TOKEN, reddit, db);
const fridayController = new FridayController(nsfwBot);

// CORS
app.use(cors());
app.use(express.json({ limit: "350mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit: "350mb" })); // for parsing application/x-www-form-urlencoded
// Звено для авторизации
app.use(authMiddleware);

const fridayRouer = new FridayRouter(
  nsfwBot,
  "/api/botFriday",
  fridayController
);
app.use("/api/botFriday", fridayRouer.router);
app.use("/api/auth", authRoutes);
app.get("/api/bashOrg", getBashContent);
app.use("/api/files", filesRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// Error handling
app.use(function (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.name === "UnauthorizedError") {
    // Send the error rather than to show it on the console
    res.status(401).send(err);
  } else {
    next(err);
  }
});

app.listen(PORT, () => console.log("Server is running..."));
