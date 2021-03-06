import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import { useModerateStore } from "../../../mobx/moderateFriday";

const ButtonRandom = () => {
  const { loadFromRandomChannel, appPending } = useModerateStore();

  return (
    <Tooltip title={!appPending ? "Запрашивает случайный канал" : ""}>
      <Button
        variant="contained"
        onClick={loadFromRandomChannel}
        disabled={appPending}
        color="default"
        startIcon={<HelpOutlineIcon />}
      >
        Наугад
      </Button>
    </Tooltip>
  );
};

export default observer(ButtonRandom);
