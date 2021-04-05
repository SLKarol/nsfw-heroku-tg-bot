import Typography from "@material-ui/core/Typography";
import ReactMarkdown from "react-markdown";

const ArticleContent = ({ children }) => (
  <Typography>
    <ReactMarkdown variant="article">{children}</ReactMarkdown>
  </Typography>
);

export default ArticleContent;
