import Button from "@material-ui/core/Button";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

const Controls = ({ onPlay, onStop, onDownload, busy }) => {
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
    </div>
  );
};

export default Controls;
