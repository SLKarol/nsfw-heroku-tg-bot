import { FC } from "react";
import { flowResult } from "mobx";
import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";

import { useChannelStore } from "../../../mobx/channels";

const ConfirmButtons: FC = () => {
  const { setOperation, handleDeleteChannel } = useChannelStore();
  const handleClose = () => setOperation("view");
  const handleDelete = () => flowResult(handleDeleteChannel());
  return (
    <>
      <Button color="primary" onClick={handleClose}>
        Отмена
      </Button>
      <Button color="primary" onClick={handleDelete}>
        Удалить
      </Button>
    </>
  );
};

export default observer(ConfirmButtons);
