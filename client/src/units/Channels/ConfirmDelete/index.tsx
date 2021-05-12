import { FC } from "react";
import { observer } from "mobx-react-lite";

import { useChannelStore } from "../../../mobx/channels";

import ConfirmDelete from "./ConfirmDelete";

const ConfirmDelChannel: FC = () => {
  const { operation } = useChannelStore();

  if (operation === "delete") {
    return <ConfirmDelete />;
  }
  return null;
};

export default observer(ConfirmDelChannel);
