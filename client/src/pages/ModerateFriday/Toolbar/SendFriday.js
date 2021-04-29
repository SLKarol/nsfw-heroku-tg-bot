import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";

import { useModerateStore } from "mobx/moderateFriday";

const SendFriday = () => {
  const { countSelected, handleSendSelectedRecords } = useModerateStore();

  return (
    <Button
      variant="contained"
      color="secondary"
      disabled={!countSelected}
      onClick={handleSendSelectedRecords}
    >
      Отправить
    </Button>
  );
};

export default observer(SendFriday);
