import { observer } from "mobx-react-lite";
import MuiAlert from "@material-ui/lab/Alert";

import { useModerateStore } from "mobx/moderateFriday";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const FetchStatus = () => {
  const { state, error } = useModerateStore();
  if (state === "success") {
    return <Alert severity="success">Ваша команда выполнена.</Alert>;
  }
  if (state === "error") {
    return <Alert severity="error">{error}</Alert>;
  }
  return null;
};

export default observer(FetchStatus);
