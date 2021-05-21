import { FC, useState } from "react";
import Backdrop from "@material-ui/core/Backdrop";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import { ClickHandler } from "../../types/functions";
import { TypeNSFW } from "../../types/nsfw";

import { sendNSFW } from "../../lib/nsfw";

import Error from "../../components/Error";

const Mailing: FC = () => {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Готов отправить");

  const onClick: ClickHandler = (e) => {
    setBusy(true);
    setStatus("Отправка...");
    const name = e.currentTarget.getAttribute("data-name") as TypeNSFW;
    sendNSFW(name)
      .then((re) => {
        if (+re === 200) {
          return setStatus(`${name} успешно отправлено.`);
        }
        return setStatus(`${name} не отправлено из-за ошибки.`);
      })
      .then(() => setBusy(false))
      .catch(() => {
        setBusy(false);
        setStatus(`${name} не отправлено из-за ошибки.`);
      });
  };

  return (
    <>
      <Backdrop open={busy}></Backdrop>
      <ButtonGroup size="large" aria-label="outlined primary button group">
        <Button data-name="photo" onClick={onClick}>
          Рассылка фото
        </Button>
      </ButtonGroup>
      <Error message={status} severity="info" />
    </>
  );
};

export default Mailing;
