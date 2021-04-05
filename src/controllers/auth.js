const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const getConnection = require("../lib/getConnection");

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        validationErrors: errors.array(),
      });
    }
  }
  getConnection()
    .then((conn) => {
      const TgUsers = conn.model("TgUsers");
      return TgUsers.findOne({ email: email });
    })
    .then((user) => {
      if (!user) {
        return res.status(422).json({
          errorMessage: "Invalid email or password.",
          validationErrors: [],
        });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          const userId = user._id.toString();
          const token = jwt.sign(
            {
              userId,
              email: user.email,
            },
            process.env.TOKEN_JWT,
            { expiresIn: "1h" }
          );
          return res.json({
            token,
            userId,
          });
        }
        return res.status(422).json({
          errorMessage: "Invalid email or password.",
          validationErrors: [],
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
