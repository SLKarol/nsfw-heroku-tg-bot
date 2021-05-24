import { FC } from "react";
import Button from "@material-ui/core/Button";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import { makeStyles } from "@material-ui/core/styles";

import { ClickHandler } from "../../../../../types/functions";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

type Props = {
  onPlay: ClickHandler;
  onStop: ClickHandler;
  onDownload: ClickHandler;
  busy: boolean;
  permalink: string;
};

const Controls: FC<Props> = ({
  onPlay,
  onStop,
  onDownload,
  busy,
  permalink,
}) => {
  const classes = useStyles();
  return (
    <div>
      <Button
        variant="contained"
        color="default"
        className={classes.button}
        startIcon={<PlayArrowIcon />}
        onClick={onPlay}
      >
        Play
      </Button>
      <Button
        variant="contained"
        color="default"
        className={classes.button}
        startIcon={<StopIcon />}
        onClick={onStop}
      >
        Stop
      </Button>
      <Button
        variant="contained"
        color="default"
        className={classes.button}
        startIcon={<CloudDownloadIcon />}
        onClick={onDownload}
        disabled={busy}
      >
        Download
      </Button>
      <Button
        variant="contained"
        color="default"
        className={classes.button}
        startIcon={<VideoLibraryIcon />}
        disabled={busy}
        href={`https://www.reddit.com${permalink}`}
        target="_blank"
      >
        Original
      </Button>
    </div>
  );
};

export default Controls;
