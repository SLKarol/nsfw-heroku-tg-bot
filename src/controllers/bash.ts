import { Request, Response, NextFunction } from "express";
import getListBashOrg from "@stanislavkarol/get-bash-im-rss";

export default function getBashContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  getListBashOrg()
    .then((list) => {
      res.json(list);
      return next();
    })
    .catch((err) => {
      res.status(500);
      const error = new Error(err);
      return next(error);
    });
}
