import { FC } from "react";
import { flowResult } from "mobx";
import { observer } from "mobx-react-lite";
import Button from "@material-ui/core/Button";

import { useFormStore } from "../../../mobx/crUpChannel";
import { useChannelStore } from "../../../mobx/channels";

type Props = {
  handleClose: () => void;
};

const DialogControls: FC<Props> = ({ handleClose }) => {
  const { disabledForm, name, withVideo, moderationRequired } = useFormStore();
  const { handleSaveChannel } = useChannelStore();
  const handleSave = () =>
    flowResult(handleSaveChannel(name, withVideo, moderationRequired));
  return (
    <>
      <Button onClick={handleClose} color="primary">
        Отмена
      </Button>
      <Button onClick={handleSave} color="primary" disabled={disabledForm}>
        Сохранить
      </Button>
    </>
  );
};

export default observer(DialogControls);
