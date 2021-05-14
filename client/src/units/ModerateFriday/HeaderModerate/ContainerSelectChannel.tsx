import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import SelectChannel from "./SelectChannel";
import SelectType from "./SelectType";
import ButtonReload from "./ButtonReload";
import ButtonRandom from "./ButtonRandom";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  buttons: {
    alignSelf: "center",
  },
}));

const ContainerSelectChannel = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <SelectChannel />
      </Grid>
      <Grid item xs>
        <SelectType />
      </Grid>
      <Grid item xs className={classes.buttons}>
        <ButtonReload />
      </Grid>
      <Grid item xs className={classes.buttons}>
        <ButtonRandom />
      </Grid>
    </Grid>
  );
};

export default observer(ContainerSelectChannel);
