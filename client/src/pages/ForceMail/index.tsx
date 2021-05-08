import { Redirect } from "react-router-dom";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import HeaderPage from "../../components/HeaderPage";
import Mailing from "./Mailing";

const ForceMail = () => {
  const token = localStorage.getItem("token");
  const expiryDate = localStorage.getItem("expiryDate");
  if (!token || !expiryDate) {
    return <Redirect to="/signin" />;
  }
  if (new Date(expiryDate) <= new Date()) {
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");

    return <Redirect to="/signin" />;
  }

  return (
    <Container maxWidth="lg">
      <HeaderPage title="Принудительная рассылка NSFW" />
      <Typography variant="subtitle1" gutterBottom>
        Вы не сможете контролировать содержимое рассылки, только её отправку.
        <br />
        Не нужно делать подряд две рассылки, подождите между ними 10 минут.
      </Typography>
      <Mailing />
    </Container>
  );
};

export default ForceMail;
