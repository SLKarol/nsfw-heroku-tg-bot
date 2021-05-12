import { FC } from "react";
import Button from "@material-ui/core/Button";

import { ClickHandler } from "../../types/functions";

import HeaderPage from "../../components/HeaderPage";

type Props = {
  disabled: boolean;
  onClick: ClickHandler;
};

const Header: FC<Props> = ({ onClick, disabled }) => (
  <HeaderPage title="Рассылка выпусков БОР">
    <Button color="inherit" disabled={disabled} onClick={onClick}>
      Сделать рассылку
    </Button>
  </HeaderPage>
);

export default Header;
