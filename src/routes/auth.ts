import express from "express";
import { body } from "express-validator";

import * as authController from "../controllers/auth";
const router = express.Router();

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.").isLength({ min: 5 }).trim(),
  ],
  authController.postLogin
);

export default router;
