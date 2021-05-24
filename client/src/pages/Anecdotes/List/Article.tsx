import { FC } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";

import { OnCheck } from "../../../types/functions";

import ArticleTitle from "./ArticleTitle";
import ArticleContent from "./ArticleContent";

type Props = {
  id: string;
  title: string;
  content: string;
  onCheck: OnCheck;
  selected: boolean;
};

const useStyles = makeStyles({
  content: {
    boxShadow: "4px 4px 8px 0px rgba(34, 60, 80, 0.2)",
    width: "100%",
  },
});

const Article: FC<Props> = ({ title, id, content, onCheck, selected }) => {
  const classes = useStyles();
  return (
    <>
      <Checkbox
        inputProps={{ "aria-label": "primary checkbox" }}
        color="primary"
        name={id}
        onChange={onCheck}
        checked={selected}
      />
      <div className={classes.content}>
        <ArticleTitle>{title}</ArticleTitle>
        <ArticleContent>{content}</ArticleContent>
      </div>
    </>
  );
};

export default Article;
