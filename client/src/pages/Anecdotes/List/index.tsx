import { FC } from "react";

import { BashOrgUI } from "types/bashOrg";
import { OnCheck } from "types/functions";

import styles from "./index.module.css";
import Article from "./Article";

type Props = {
  list: BashOrgUI[];
  onCheck: OnCheck;
};

const Anecdotes: FC<Props> = ({ list, onCheck }) => {
  return (
    <div className={styles.grid}>
      {list.map((record) => (
        <Article key={record.id} {...record} onCheck={onCheck} />
      ))}
    </div>
  );
};

export default Anecdotes;
