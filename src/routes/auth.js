const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
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

module.exports = router;
