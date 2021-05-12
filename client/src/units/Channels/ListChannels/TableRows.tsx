import { FC } from "react";
import { observer } from "mobx-react-lite";

import { useChannelStore } from "../../../mobx/channels";

import Row from "./Row";
type Props = {};

const TableRows: FC<Props> = () => {
  const { list } = useChannelStore();
  return (
    <>
      {list.map((row) => (
        <Row
          key={row._id}
          id={row._id}
          name={row.name}
          withVideo={row.withVideo}
          moderationRequired={row.moderationRequired}
        />
      ))}
    </>
  );
};

export default observer(TableRows);
