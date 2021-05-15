import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";
import TelegramIcon from "@material-ui/icons/Telegram";

import { useModerateStore } from "../../../mobx/moderateFriday";

const SendFriday = () => {
  const { countSelected, handleSendSelectedRecords, appPending } =
    useModerateStore();

  return (
    <Button
      variant="contained"
      color="secondary"
      disabled={!countSelected || appPending}
      onClick={handleSendSelectedRecords}
      startIcon={<TelegramIcon />}
    >
      Отправить
    </Button>
  );
};

export default observer(SendFriday);
