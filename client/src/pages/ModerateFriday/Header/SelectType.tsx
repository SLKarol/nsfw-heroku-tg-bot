import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import { useModerateStore } from "mobx/moderateFriday";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
  },
}));

const SelectType = () => {
  const { typeMailing, handleChangeFilter } = useModerateStore();
  const classes = useStyles();

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel>Вид рассылки</InputLabel>
      <Select
        value={typeMailing}
        onChange={handleChangeFilter}
        name="typeMailing"
      >
        <MenuItem value="photo">Фото</MenuItem>
        <MenuItem value="video">Видео</MenuItem>
      </Select>
    </FormControl>
  );
};

export default observer(SelectType);
