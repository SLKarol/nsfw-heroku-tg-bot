/**
 * Запись с mp4
 */
const mp4Record = {
  title: "Nice",
  url: "https://v.redd.it/x6mmhat6",
  is_video: true,
  media: {
    reddit_video: {
      bitrate_kbps: 2400,
      fallback_url: "https://v.redd.it/x6mmhat6/DASH_720.mp4?source=fallback",
      height: 720,
      width: 578,
    },
  },
};

/**
 * Запись с картинкой
 */
const pictureRecord = {
  title: "Start in one hole and finish in the other",
  url: "https://i.redd.it/61.jpg",
  is_video: false,
  media: null,
};

/**
 * Запись с gifv
 */
const gifvRecord = {
  title: "Bouncing Out of Her Bra",
  url: "https://i.imgur.com/Xsz22CR.gifv",
  is_video: false,
  media: null,
};

export { gifvRecord, mp4Record, pictureRecord };
