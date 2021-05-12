import { FC } from "react";
import TableCell from "@material-ui/core/TableCell";

type Props = {
  value: unknown;
};

const CellText: FC<Props> = ({ value }) => {
  return (
    <TableCell component="th" scope="row">
      {value as string}
    </TableCell>
  );
};

export default CellText;
