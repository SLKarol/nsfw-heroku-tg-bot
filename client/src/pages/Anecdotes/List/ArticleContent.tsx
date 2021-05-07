import { FC } from "react";
import Typography from "@material-ui/core/Typography";
import ReactMarkdown from "react-markdown";

const ArticleContent: FC = ({ children = "" }) => (
  <Typography variant="body1">
    <ReactMarkdown>{children?.toString() || ""}</ReactMarkdown>
  </Typography>
);

export default ArticleContent;
