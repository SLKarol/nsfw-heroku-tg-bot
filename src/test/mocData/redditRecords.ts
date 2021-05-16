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

const gifvWithMedia = {
  media: {
    type: "redgifs.com",
    oembed: {
      provider_url: "https://www.redgifs.com/",
      version: "1.0",
      title: "Anal Porn GIF",
      type: "video",
      thumbnail_width: 640,
      height: 338,
      width: 600,
      html: '<iframe src="https://www.redgifs.com/ifr/disloyaldevotedbrahmancow" frameborder="0" scrolling="no" width="100%" height="100%"\n      allowfullscreen style="position:absolute;"></iframe>',
      author_name: "leshdporn",
      provider_name: "RedGIFs",
      thumbnail_url:
        "https://thumbs2.redgifs.com/DisloyalDevotedBrahmancow-mobile.jpg",
      thumbnail_height: 360,
      author_url: "https://www.redgifs.com/users/leshdporn",
    },
  },
  is_video: false,
  title: "[FFF] Alexis Fawx, Kira Noir, Penny Pax",
};

const givfAsGif = {
  is_video: false,
  title: "[fff] Lesbian Threesome (",
  media: {
    type: "redgifs.com",
    oembed: {
      provider_url: "https://www.redgifs.com/",
      version: "1.0",
      title: "A porn gif",
      author_name: "lickmyspaghetti",
      height: 338,
      width: 600,
      html: '<iframe src="https://www.redgifs.com/ifr/unhealthyminoralpineroadguidetigerbeetle" frameborder="0" scrolling="no" width="100%" height="100%"\n      allowfullscreen style="position:absolute;"></iframe>',
      author_url: "https://www.redgifs.com/users/lickmyspaghetti",
      provider_name: "RedGIFs",
      type: "video",
    },
  },
};

export { gifvRecord, mp4Record, pictureRecord, gifvWithMedia, givfAsGif };
