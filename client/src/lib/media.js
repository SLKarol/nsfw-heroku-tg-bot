import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export async function downloadMedia(video, audio = null) {
  if (audio === null) {
    return fetchFile(video);
  }
  return mergeAudioVideo(video, audio);
}

/**
 * Объединяет два видео и аудио файлы в один видеофайл
 * @param {string} videoUrl Ссылка на видео
 * @param {string} audioUrl Ссылка на аудио
 * @returns
 */
async function mergeAudioVideo(video, audio) {
  let ffmpeg = createFFmpeg();
  await ffmpeg.load();

  const videoPromise = await fetchMediaBlob(video);
  if (videoPromise === null) {
    return null;
  }
  const audioPromise = await fetchMediaBlob(audio);
  if (audioPromise === null) {
    return videoPromise;
  }
  ffmpeg.FS("writeFile", "video.mp4", videoPromise);
  ffmpeg.FS("writeFile", "audio.mp4", audioPromise);
  await ffmpeg.run(
    "-i",
    "video.mp4",
    "-i",
    "audio.mp4",
    "-c",
    "copy",
    "output.mp4"
  );
  const data = await ffmpeg.FS("readFile", "output.mp4");
  ffmpeg.FS("unlink", "video.mp4");
  ffmpeg.FS("unlink", "audio.mp4");
  ffmpeg.FS("unlink", "output.mp4");
  return data;
}

/**
 * Скачать медиа-файл, вернуть Blob
 * @param {string} url
 * @returns
 */
async function fetchMediaBlob(url) {
  const response = await fetch(url);
  if (response.status !== 200) {
    return new Promise((resolve) => resolve(null));
  }
  const blob = await response.blob();
  return fetchFile(blob);
}
