import { flowResult } from "mobx";
import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import { useModerateStore } from "../../../mobx/moderateFriday";

const ButtonReload = () => {
  const { loadRecords, appPending } = useModerateStore();
  const onClick = () => flowResult(loadRecords());
  return (
    <Tooltip title="Запрашивает выбранный канал, выбранное содержимое">
      <Button
        variant="contained"
        onClick={onClick}
        disabled={appPending}
        color="primary"
        startIcon={<CloudDownloadIcon />}
      >
        Загрузить
      </Button>
    </Tooltip>
  );
};

export default observer(ButtonReload);
