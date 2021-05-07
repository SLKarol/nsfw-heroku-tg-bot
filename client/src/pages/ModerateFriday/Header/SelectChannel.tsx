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
  hasVideo: {
    marginLeft: 12,
  },
}));

const SelectChannel = () => {
  const {
    channelsStore: { list },
    handleChangeFilter,
    selectedChannel,
  } = useModerateStore();
  const classes = useStyles();

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel>Список каналов</InputLabel>
      <Select
        value={selectedChannel}
        onChange={handleChangeFilter}
        name="selectedChannel"
      >
        {list &&
          list.map((l) => (
            <MenuItem value={l._id} key={l._id}>
              {l.name}
              {l.withVideo && <i className={classes.hasVideo}>(есть видео)</i>}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default observer(SelectChannel);
