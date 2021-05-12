import { FC } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Typography from "@material-ui/core/Typography";

import { ClickHandler } from "../../types/functions";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    rightToolbar: {
      marginLeft: "auto",
      marginRight: -12,
    },
  })
);

type Props = {
  handlerClickButton?: ClickHandler;
  hasSelectRow?: boolean;
  disabled?: boolean;
  status?: string;
};

const DataTableToolBar: FC<Props> = ({
  hasSelectRow = false,
  handlerClickButton,
  disabled = false,
  status = "",
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <IconButton
            onClick={handlerClickButton}
            disabled={disabled}
            id="refresh"
            name="refresh"
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={handlerClickButton}
            disabled={disabled}
            name="add"
          >
            <AddIcon />
          </IconButton>
          <IconButton
            disabled={!hasSelectRow || disabled}
            onClick={handlerClickButton}
            name="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            disabled={!hasSelectRow || disabled}
            onClick={handlerClickButton}
            name="delete"
          >
            <DeleteIcon />
          </IconButton>
          <section className={classes.rightToolbar}>
            <Typography variant="h6" color="primary">
              {status}
            </Typography>
          </section>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default DataTableToolBar;
