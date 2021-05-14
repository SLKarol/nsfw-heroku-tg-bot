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

export default imageInfo;
