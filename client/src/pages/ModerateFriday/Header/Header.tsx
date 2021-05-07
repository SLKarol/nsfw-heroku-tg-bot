/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { useModerateStore } from "mobx/moderateFriday";

import SelectChannel from "./SelectChannel";
import SelectType from "./SelectType";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  buttons: {
    alignSelf: "center",
  },
}));

const Header = () => {
  const {
    channelsStore: { loadList },
    loadRecords,
    appPending,
  } = useModerateStore();

  useEffect(() => {
    loadList();
  }, []);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <SelectChannel />
        </Grid>
        <Grid item xs={3}>
          <SelectType />
        </Grid>
        <Grid item xs={3} className={classes.buttons}>
          <Button
            variant="contained"
            onClick={loadRecords}
            disabled={appPending}
          >
            Что нового?
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default observer(Header);
