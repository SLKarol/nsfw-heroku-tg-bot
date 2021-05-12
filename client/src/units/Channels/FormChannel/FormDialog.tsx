import { FC } from "react";
import { observer } from "mobx-react-lite";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { useFormStore } from "../../../mobx/crUpChannel";

const FormDialog: FC = () => {
  const { name, onChange, withVideo, moderationRequired } = useFormStore();
  return (
    <>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Reddit канал"
        type="text"
        fullWidth
        onChange={onChange}
        value={name}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={withVideo}
            onChange={onChange}
            name="withVideo"
            color="primary"
          />
        }
        label="Есть видео"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={moderationRequired}
            onChange={onChange}
            name="moderationRequired"
            color="primary"
          />
        }
        label="Требуется модерация"
      />
    </>
  );
};

export default observer(FormDialog);
