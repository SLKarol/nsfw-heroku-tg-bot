import { FC } from "react";
import { useHistory } from "react-router-dom";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

type Props = {
  title: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
);

const HeaderPage: FC<Props> = ({ title, children }) => {
  const classes = useStyles();
  const history = useHistory();
  const onClickBack = () => history.push("/");
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          {children}
          <Button color="inherit" onClick={onClickBack}>
            Назад
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HeaderPage;
