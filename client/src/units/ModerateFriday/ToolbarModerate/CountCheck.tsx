import { observer } from "mobx-react-lite";
import Typography from "@material-ui/core/Typography";

import { useModerateStore } from "../../../mobx/moderateFriday";

const CountCheck = () => {
  const { countSelected, countAll } = useModerateStore();
  return (
    <>
      <Typography
        variant="body1"
        gutterBottom
      >{`Всего: ${countAll}`}</Typography>
      <Typography
        variant="body1"
        gutterBottom
      >{`Выбрано: ${countSelected}`}</Typography>
    </>
  );
};

export default observer(CountCheck);
