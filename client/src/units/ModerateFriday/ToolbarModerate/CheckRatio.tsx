import { observer } from "mobx-react-lite";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { useModerateStore } from "../../../mobx/moderateFriday";

const CheckRatio = () => {
  const {
    disableToggleCorrectDimensions,
    toggleShowCorrectImages,
    onlyCorrectDimensions,
  } = useModerateStore();
  return (
    <FormControlLabel
      control={
        <Checkbox
          name="typeMailing"
          color="primary"
          disabled={disableToggleCorrectDimensions}
          onChange={toggleShowCorrectImages}
          checked={onlyCorrectDimensions}
        />
      }
      label="Изображения с размерами по требованиям api-телеграмм"
    />
  );
};

export default observer(CheckRatio);
