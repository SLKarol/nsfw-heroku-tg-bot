import { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  img: {
    border: `1px solid ${theme.palette.divider}`,
    maxWidth: "100%",
    boxShadow: theme.shadows[4],
  },
}));

/**
 * Фото в рамке
 * @param {Object} props
 * @param {string} props.url - Адрес фото
 * @param {string} props.title - Название
 * @returns
 */
const Photo: FC<{ url: string; title: string }> = ({ url, title }) => {
  const classes = useStyles();
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt={title} className={classes.img} />
    </a>
  );
};

export default Photo;
