import { FC } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { useModerateStore } from "../../mobx/moderateFriday";

const CheckMaterial: FC<{ url?: string; title: string; checked: boolean }> = ({
  url = "",
  title,
  checked,
}) => {
  const { handleSelectMaterial } = useModerateStore();

  return (
    <figcaption>
      <FormControlLabel
        control={
          <Checkbox
            name={url}
            color="primary"
            checked={checked}
            onChange={handleSelectMaterial}
          />
        }
        label={title}
      />
    </figcaption>
  );
};

export default CheckMaterial;
