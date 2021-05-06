import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

dotenv.config();

type Token = {
  userId: string;
};

/**
 * Миддлвар для проверки наличия авторизации
 */
function auth(req: Request, res: Response, next: NextFunction) {
  // const authHeader = req.get("Authorization");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken: Token;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_JWT || "") as Token;
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
}

export default auth;
