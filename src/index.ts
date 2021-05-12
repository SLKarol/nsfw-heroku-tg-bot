import path from "path";
import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import asyncHandler from "express-async-handler";
import * as dotenv from "dotenv";

import TOKEN from "./const/token";
import Reddit from "./lib/reddit";
import NSFWBot from "./bots/NSFWBot";
import FridayRouter from "./routes/fridayRouter";
import ModelNsfw from "./lib/modelNsfw";
import authMiddleware from "./middleware/auth";
import authRoutes from "./routes/auth";
import getBashContent from "./controllers/bash";
import isFriDay from "./lib/isFriDay";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const db = new ModelNsfw();
const reddit = new Reddit();
const nsfwBot = new NSFWBot(TOKEN, reddit, db);

// CORS
app.use(cors());
app.use(express.json({ limit: "350mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit: "350mb" })); // for parsing application/x-www-form-urlencoded
// Звено для авторизации
app.use(authMiddleware);

const fridayRouer = new FridayRouter(nsfwBot, "/api/botFriday");
app.use("/api/botFriday", fridayRouer.router);
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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("/*", function (req, res) {
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
