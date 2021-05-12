import { FC } from "react";

import { useChannelStore } from "../../../mobx/channels";

import DataRow from "../../../components/TableParts/Row";
import CellText from "../../../components/TableParts/CellText";
import CellBoolean from "../../../components/TableParts/CellBoolean";
import CellButtonEdit from "../../../components/TableParts/CellButtonEdit";

type Props = {
  id: string;
  name: string;
  withVideo: boolean;
  moderationRequired: boolean;
};

const Row: FC<Props> = ({ name, withVideo, moderationRequired, id }) => {
  const { onClickControlButton } = useChannelStore();

  return (
    <DataRow>
      <CellButtonEdit onClick={onClickControlButton} id={id} />
      <CellText value={name} />
      <CellBoolean value={withVideo} />
      <CellBoolean value={moderationRequired} />
    </DataRow>
  );
};

export default Row;
