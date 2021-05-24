import { FC } from "react";

import { useChannelStore } from "../../../mobx/channels";

import DataRow from "../../../components/TableParts/Row";
import CellBoolean from "../../../components/TableParts/CellBoolean";
import CellButtonEdit from "../../../components/TableParts/CellButtonEdit";
import CellLink from "../../../components/TableParts/CellLink";

type Props = {
  id: string;
  name: string;
  withVideo: boolean;
  moderationRequired: boolean;
};

const REDDIT_BASE = "https://www.reddit.com/r/";

const Row: FC<Props> = ({ name, withVideo, moderationRequired, id }) => {
  const { onClickControlButton } = useChannelStore();
  return (
    <DataRow>
      <CellButtonEdit onClick={onClickControlButton} id={id} />
      <CellLink link={`${REDDIT_BASE}${name}/`}>{name}</CellLink>
      <CellBoolean value={withVideo} />
      <CellBoolean value={moderationRequired} />
    </DataRow>
  );
};

export default Row;
