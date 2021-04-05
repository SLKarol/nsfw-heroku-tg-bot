import { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { INIT_LIMIT_PHOTO } from "constants/mailCustomPhoto";

import styles from "./changeLimit.module.css";

const ChangeLimit = ({ onSubmit, busy }) => {
  const [limit, setLimit] = useState(INIT_LIMIT_PHOTO);
  const onChange = (e) => {
    const { value } = e.target;
    setLimit(value);
  };
  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
      className={styles.form}
      disabled={busy}
    >
      <TextField
        value={limit}
        required
        label="Количество запрашиваемых фото"
        type="number"
        min="1"
        max="50"
        helperText="Максимальное значение 50"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange}
        error={!limit}
        name="limit"
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={!limit || busy}
      >
        Запрос
      </Button>
    </form>
  );
};

export default ChangeLimit;
