import { FC } from "react";
import TableCell from "@material-ui/core/TableCell";
import CheckIcon from "@material-ui/icons/Check";

type Props = {
  value: boolean;
};

const CellBoolean: FC<Props> = ({ value }) => (
  <TableCell align="right">{value ? <CheckIcon /> : ""}</TableCell>
);

export default CellBoolean;
