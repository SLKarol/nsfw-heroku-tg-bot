import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { IUser } from "../schema/tgUsers";

import getConnection from "../lib/getConnection";

export function postLogin(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        validationErrors: errors.array(),
      });
    }
  }
  getConnection()
    .then((conn) => {
      const TgUsers = conn.model<IUser>("TgUsers");
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
            process.env.TOKEN_JWT || "",
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
      res.status(500);
      const error = new Error(err);
      return next(error);
    });
}
