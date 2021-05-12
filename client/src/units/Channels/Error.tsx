import { observer } from "mobx-react-lite";

import { useChannelStore } from "../../mobx/channels";

import Alert from "../../components/Alert/Alert";

const Error = () => {
  const { error } = useChannelStore();
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return null;
};

export default observer(Error);
