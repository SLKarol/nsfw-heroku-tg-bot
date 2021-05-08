import { observer } from "mobx-react-lite";
import Alert from "../../../components/Alert/Alert";

import { useModerateStore } from "../../../mobx/moderateFriday";

const StatusBar = () => {
  const { state, error, appPending } = useModerateStore();
  if (state === "success") {
    return <Alert severity="success">Ваша команда выполнена.</Alert>;
  }
  if (state === "error") {
    return <Alert severity="error">{error}</Alert>;
  }
  if (appPending) {
    return <Alert severity="warning">Ждите...</Alert>;
  }
  return null;
};

export default observer(StatusBar);
