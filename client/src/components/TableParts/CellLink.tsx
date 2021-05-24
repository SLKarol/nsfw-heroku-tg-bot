import { FC } from "react";
import TableCell from "@material-ui/core/TableCell";
import Link from "@material-ui/core/Link";

type Props = {
  link: string;
};

const CellLink: FC<Props> = ({ link, children }) => {
  return (
    <TableCell component="td">
      <Link href={link}>{children}</Link>
    </TableCell>
  );
};

export default CellLink;
