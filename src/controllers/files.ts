import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import fetch from "node-fetch";

export const getRedditVideo = asyncHandler(async (req, res, next) => {
  try {
    const response = await fetch(
      "https://thumbs2.redgifs.com/HeartySnarlingFowl-mobile.mp4"
    );
    const data = await response.buffer();
    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-disposition": "attachment;filename=test.mp4",
      "Content-Length": data.length,
    });
    res.end(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
