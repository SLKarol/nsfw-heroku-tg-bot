import { FC } from "react";
import Checkbox from "@material-ui/core/Checkbox";

import { OnCheck } from "types/functions";

import styles from "./article.module.css";
import ArticleTitle from "./ArticleTitle";
import ArticleContent from "./ArticleContent";

type Props = {
  id: string;
  title: string;
  content: string;
  onCheck: OnCheck;
  selected: boolean;
};

const Article: FC<Props> = ({ title, id, content, onCheck, selected }) => {
  return (
    <>
      <Checkbox
        inputProps={{ "aria-label": "primary checkbox" }}
        color="primary"
        name={id}
        onChange={onCheck}
        checked={selected}
      />
      <div className={styles.content}>
        <ArticleTitle>{title}</ArticleTitle>
        <ArticleContent>{content}</ArticleContent>
      </div>
    </>
  );
};

export default Article;
