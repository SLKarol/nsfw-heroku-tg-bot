import { FC } from "react";
import { observer } from "mobx-react-lite";

import { useChannelStore } from "../../mobx/channels";

import DataTableToolBar from "../../components/DataTableToolBar";

const ChannelsToolbar: FC = () => {
  const { onClickControlButton, disabledForm, stateName } = useChannelStore();
  return (
    <DataTableToolBar
      handlerClickButton={onClickControlButton}
      disabled={disabledForm}
      status={stateName}
    />
  );
};

export default observer(ChannelsToolbar);
