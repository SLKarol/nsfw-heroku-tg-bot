import { FC } from "react";
import TableCell from "@material-ui/core/TableCell";

const CellText: FC = ({ children }) => {
  return <TableCell component="td">{children}</TableCell>;
};

export default CellText;
