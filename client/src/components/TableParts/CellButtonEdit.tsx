import { FC } from "react";
import TableCell from "@material-ui/core/TableCell";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";

import { ClickHandler } from "../../types/functions";

interface Props {
  id?: string;
  onClick?: ClickHandler;
}

const CellButtonEdit: FC<Props> = ({ id, onClick }) => {
  return (
    <TableCell>
      <IconButton name="edit" data-id={id} onClick={onClick}>
        <EditIcon />
      </IconButton>
      <IconButton name="delete" data-id={id} onClick={onClick}>
        <DeleteIcon />
      </IconButton>
    </TableCell>
  );
};

export default CellButtonEdit;
