import { observer } from "mobx-react-lite";
import Typography from "@material-ui/core/Typography";

import { useModerateStore } from "../../../mobx/moderateFriday";

const CountCheck = () => {
  const { countSelected } = useModerateStore();
  return (
    <Typography
      variant="body1"
      gutterBottom
    >{`Выбрано: ${countSelected}`}</Typography>
  );
};

export default observer(CountCheck);
