import asyncHandler from "express-async-handler";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export const getRedditVideo = asyncHandler(async (req, res, next) => {
  try {
    if (!fs.existsSync(path.join(__dirname, "../tmp"))) {
      fs.mkdirSync(path.join(__dirname, "../tmp"));
    }
    await Promise.all([
      fetch("https://v.redd.it/7cd3dd9dbc171/DASH_480.mp4")
        .then((response) => response.buffer())
        .then((buffer) => {
          fs.writeFileSync(path.join(__dirname, "../tmp/video.mp4"), buffer);
        }),
      fetch("https://v.redd.it/7cd3dd9dbc171/DASH_audio.mp4")
        .then((response) => response.buffer())
        .then((buffer) => {
          fs.writeFileSync(path.join(__dirname, "../tmp/audio.mp4"), buffer);
        }),
    ]);

    ffmpeg({ source: path.join(__dirname, "../tmp/video.mp4") })
      .addInput(path.join(__dirname, "../tmp/audio.mp4"))
      .saveToFile(path.join(__dirname, "../tmp/result.mp4"))
      .on("end", function () {
        res.writeHead(200, {
          "Content-Type": "video/mp4",
          "Content-disposition": "attachment;filename=test.mp4",
        });
        const filestream = fs.createReadStream(
          path.join(__dirname, "../tmp/result.mp4")
        );
        filestream.pipe(res);
      })
      .on("error", function (err) {
        res.status(500).json({ error: err.message });
        console.log("an error happened: " + err.message);
      });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});
