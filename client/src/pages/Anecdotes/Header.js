import Button from "@material-ui/core/Button";

import HeaderPage from "components/HeaderPage";

const Header = ({ onClick, disable }) => (
  <HeaderPage title="Список анекдотов">
    <Button
      variant="outlined"
      size="small"
      disabled={disable}
      onClick={onClick}
    >
      Сделать рассылку
    </Button>
  </HeaderPage>
);

export default Header;
