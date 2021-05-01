import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { useModerateStore } from "mobx/moderateFriday";

const CheckMaterial = ({ url, title, checked }) => {
  const { handleChangeSelect } = useModerateStore();

  return (
    <figcaption>
      <FormControlLabel
        control={
          <Checkbox
            name={url}
            color="primary"
            checked={checked}
            onChange={handleChangeSelect}
          />
        }
        label={title}
      />
    </figcaption>
  );
};

export default CheckMaterial;
