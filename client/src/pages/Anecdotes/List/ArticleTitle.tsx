import { FC } from "react";
import Typography from "@material-ui/core/Typography";

const ArticleTitle: FC = ({ children }) => (
  <Typography variant="h6" gutterBottom>
    {children}
  </Typography>
);

export default ArticleTitle;
