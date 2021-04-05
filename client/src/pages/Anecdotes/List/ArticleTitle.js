import Typography from "@material-ui/core/Typography";

const ArticleTitle = ({ children }) => (
  <Typography variant="h6" gutterBottom>
    {children}
  </Typography>
);

export default ArticleTitle;
