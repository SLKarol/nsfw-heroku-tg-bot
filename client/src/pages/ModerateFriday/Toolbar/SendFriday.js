import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";

import { useModerateStore } from "mobx/moderateFriday";

const SendFriday = () => {
  const {
    countSelected,
    handleSendSelectedRecords,
    appPending,
  } = useModerateStore();

  return (
    <Button
      variant="contained"
      color="primary"
      disabled={!countSelected || appPending}
      onClick={handleSendSelectedRecords}
    >
      Отправить
    </Button>
  );
};

export default observer(SendFriday);
