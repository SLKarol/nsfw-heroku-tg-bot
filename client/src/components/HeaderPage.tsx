import { FC } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: "space-between",
    overflowX: "auto",
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
}));

type Props = {
  title: string;
};

const HeaderPage: FC<Props> = ({ title, children }) => {
  const classes = useStyles();
  const history = useHistory();
  const onClickBack = () => history.push("/");
  return (
    <>
      <Toolbar className={classes.toolbar}>
        <Button size="small" onClick={onClickBack}>
          Назад
        </Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          className={classes.toolbarTitle}
        >
          {title}
        </Typography>
        {children}
      </Toolbar>
    </>
  );
};

export default HeaderPage;
