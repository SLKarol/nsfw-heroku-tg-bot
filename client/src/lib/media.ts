import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

/**
 * Скачивание медиа-файла
 * @param {string} videoUrl Ссылка на видео
 * @param {string} audioUrl Ссылка на аудио
 * @returns {Promise<Uint8Array>}
 */
export async function downloadMedia(
  videoUrl: string,
  audioUrl: string | null = null
) {
  if (audioUrl === null) {
    return videoUrl;
  }
  return mergeAudioVideo(videoUrl, audioUrl);
}

/**
 * Объединяет два видео и аудио файлы в один видеофайл
 * @param {string} videoUrl Ссылка на видео
 * @param {string} audioUrl Ссылка на аудио
 * @returns {Promise<Uint8Array>}
 */
async function mergeAudioVideo(videoUrl: string, audioUrl: string) {
  let ffmpeg = createFFmpeg();
  await ffmpeg.load();

  const audioPromise = await fetchMediaBlob(audioUrl);
  if (audioPromise === null) {
    return videoUrl;
  }

  const videoPromise = await fetchMediaBlob(videoUrl);
  if (videoPromise === null) {
    return null;
  }

  ffmpeg.FS("writeFile", "video.mp4", videoPromise as Uint8Array);
  ffmpeg.FS("writeFile", "audio.mp4", audioPromise as Uint8Array);
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
async function fetchMediaBlob(url: string) {
  const response = await fetch(url);
  if (response.status !== 200) {
    return new Promise((resolve) => resolve(null));
  }
  const blob = await response.blob();
  return fetchFile(blob);
}
