import { FC } from "react";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  row: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const Row: FC = ({ children }) => {
  const classes = useStyles();
  return <TableRow className={classes.row}>{children}</TableRow>;
};

export default Row;
