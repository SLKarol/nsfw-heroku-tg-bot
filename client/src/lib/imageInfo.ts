const imageInfo = (
  url: string,
  rejectTimeout?: number
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    let timer: NodeJS.Timeout | null = null;

    const img = new Image();

    img.addEventListener("load", () => {
      if (timer) {
        clearTimeout(timer);
      }

      resolve(img);
    });

    img.addEventListener("error", (event) => {
      if (timer) {
        clearTimeout(timer);
      }

      reject(`${event.type}: ${event.message}`);
    });

    img.src = url;

    if (rejectTimeout) {
      timer = setTimeout(() => reject("Timeout exception"), rejectTimeout);
    }
  });

function getFilesize(url: string): Promise<number> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
      const length = xhr.getResponseHeader("Content-Length");
      resolve(length === null ? -1 : +length);
      xhr.abort();
    };
    xhr.send();
  });
}

export default async function requestImageInfo(url: string) {
  const size = await getFilesize(url);
  const image = await imageInfo(url);
  return { size, height: image.height, width: image.width };
}
