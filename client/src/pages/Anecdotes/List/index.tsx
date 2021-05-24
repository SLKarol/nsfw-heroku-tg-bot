import { FC } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { BashOrgUI } from "../../../types/bashOrg";
import { OnCheck } from "../../../types/functions";

import Article from "./Article";

type Props = {
  list: BashOrgUI[];
  onCheck: OnCheck;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      columnGap: theme.spacing(1),
      rowGap: theme.spacing(2),
      justifyItems: "center",
      alignItems: "center",
      boxShadow: theme.shadows[0],
    },
  })
);

const Anecdotes: FC<Props> = ({ list, onCheck }) => {
  const styles = useStyles();
  return (
    <div className={styles.grid}>
      {list.map((record) => (
        <Article key={record.id} {...record} onCheck={onCheck} />
      ))}
    </div>
  );
};

export default Anecdotes;
