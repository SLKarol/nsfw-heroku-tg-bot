/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { flowResult } from "mobx";
import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core/styles";

import { useModerateStore } from "../../../mobx/moderateFriday";

import ContainerSelectChannel from "./ContainerSelectChannel";

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

const HeaderModerate = () => {
  const {
    channelsStore: { loadList },
  } = useModerateStore();

  useEffect(() => {
    flowResult(loadList());
  }, []);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ContainerSelectChannel />
    </div>
  );
};

export default observer(HeaderModerate);
