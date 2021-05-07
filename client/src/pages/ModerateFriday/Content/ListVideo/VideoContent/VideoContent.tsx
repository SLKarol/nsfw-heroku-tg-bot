/* eslint-disable jsx-a11y/anchor-is-valid */
import { PureComponent, createRef, RefObject } from "react";
import { withStyles, Theme } from "@material-ui/core/styles";

import { downloadMedia } from "lib/media";

import Controls from "./Controls";

const styles = (theme: Theme) => ({
  video: {
    border: `1px solid ${theme.palette.divider}`,
    maxWidth: "100%",
    minWidth: "auto",
    width: "auto",
    boxShadow: theme.shadows[4],
  },
  hideLink: {
    opacity: "0",
  },
});

type Props = {
  url?: string;
  urlAudio?: string;
  title: string;
  // classes: ReturnType<typeof styles>;
  classes: any;
};

class VideoContent extends PureComponent<Props, { download: boolean }> {
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  linkRef: RefObject<HTMLAnchorElement>;
  constructor(props: Props) {
    super(props);
    this.videoRef = createRef<HTMLVideoElement>();
    this.audioRef = createRef<HTMLAudioElement>();
    this.linkRef = createRef<HTMLAnchorElement>();
    this.state = { download: false };
  }

  getVideoProps = () => {
    const re: { type?: string } = {};
    const { url = "" } = this.props;
    if (url.endsWith("endsWith")) {
      re.type = "video/mp4";
    }
    return re;
  };

  onPlay = () => {
    if (this.videoRef.current) {
      this.videoRef.current.play();
    }
    if (this.audioRef.current) {
      this.audioRef.current.play();
    }
  };

  onStop = () => {
    if (this.videoRef.current) {
      this.videoRef.current.pause();
      this.videoRef.current.currentTime = 0;
    }
    if (this.audioRef.current) {
      this.audioRef.current.pause();
      this.audioRef.current.currentTime = 0;
    }
  };

  /**
   * Обработка нажатия на "Скачать"
   */
  onDownload = () => {
    this.setState({ download: true }, () => {
      const { url = "", urlAudio = null, title } = this.props;
      const fileName = `${title}.${url
        .split(/[#?]/)[0]
        .split(".")
        .pop()
        ?.trim()}`;

      downloadMedia(url, urlAudio).then((personUint8Array) => {
        const blob = new Blob([personUint8Array as any]);
        const href = window.URL.createObjectURL(blob);
        const a = this.linkRef.current;
        if (a !== null) {
          a.download = fileName;
          a.href = href;
          a.click();
          a.href = "";
        }
        this.setState({ download: false });
      });
    });
  };

  render() {
    const { classes, urlAudio, url } = this.props;
    const { download } = this.state;
    return (
      <div>
        <video
          {...this.getVideoProps()}
          className={classes.video}
          ref={this.videoRef}
        >
          <source src={url}></source>
        </video>
        {urlAudio && (
          <audio ref={this.audioRef}>
            <source src={urlAudio} type="audio/mpeg" />
          </audio>
        )}
        <Controls
          onPlay={this.onPlay}
          onStop={this.onStop}
          onDownload={this.onDownload}
          busy={download}
        />
        <a href="#" ref={this.linkRef} className={classes.hideLink}>
          Ссылка
        </a>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(VideoContent);
