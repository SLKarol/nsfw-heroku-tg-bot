/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import { useChannelStore } from "../../../mobx/channels";

import TableRows from "./TableRows";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCellHead: {
    fontWeight: "bold",
  },
});

const ListChannels: FC = () => {
  const { loadList } = useChannelStore();
  const classes = useStyles();

  useEffect(() => {
    loadList();
  }, []);
  return (
    <TableContainer component={Paper}>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell className={classes.tableCellHead}>Канал</TableCell>
            <TableCell className={classes.tableCellHead} align="right">
              Есть видео?
            </TableCell>
            <TableCell className={classes.tableCellHead} align="right">
              Требуется модерация?
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRows />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default observer(ListChannels);
