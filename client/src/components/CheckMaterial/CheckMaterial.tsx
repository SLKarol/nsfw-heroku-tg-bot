import { FC } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { useModerateStore } from "../../mobx/moderateFriday";

const CheckMaterial: FC<{
  url?: string;
  title: string;
  checked: boolean;
  correctMaterial?: boolean;
}> = ({ url = "", title, checked, correctMaterial = true }) => {
  const { handleSelectMaterial } = useModerateStore();
  return (
    <figcaption>
      <FormControlLabel
        control={
          <Checkbox
            name={url}
            color={correctMaterial ? "primary" : "default"}
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
