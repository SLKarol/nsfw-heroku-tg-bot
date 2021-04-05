import Checkbox from "@material-ui/core/Checkbox";

import styles from "./article.module.css";
import ArticleTitle from "./ArticleTitle";
import ArticleContent from "./ArticleContent";

const Article = ({ title, id, content, onCheck, selected }) => {
  const checked = selected.indexOf(id) > -1;
  return (
    <>
      <Checkbox
        inputProps={{ "aria-label": "primary checkbox" }}
        color="primary"
        name={id}
        onChange={onCheck}
        checked={checked}
      />
      <div className={styles.content}>
        <ArticleTitle>{title}</ArticleTitle>
        <ArticleContent>{content}</ArticleContent>
      </div>
    </>
  );
};

export default Article;
