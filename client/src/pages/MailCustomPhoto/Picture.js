import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import styles from "./picture.module.css";

const Picture = ({ title, url, checked, onChange }) => {
  return (
    <figure className={styles.figure}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={title} className={styles.img} />
      </a>
      <figcaption>
        <FormControlLabel
          control={
            <Checkbox
              name={url}
              color="primary"
              checked={checked}
              onChange={onChange}
            />
          }
          label={title}
        />
      </figcaption>
    </figure>
  );
};

export default Picture;
