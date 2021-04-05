import { Component } from "react";
import Container from "@material-ui/core/Container";
import Backdrop from "@material-ui/core/Backdrop";

import { INIT_LIMIT_PHOTO } from "constants/mailCustomPhoto";
import { getNSFW, sendFriday } from "lib/nsfw";

import HeaderPage from "components/HeaderPage";
import Error from "components/Error";
import ChangeLimit from "./ChangeLimit";
import ListPictures from "./ListPictures";

export default class MailCustomPhoto extends Component {
  state = { records: [], busy: true, error: "", sended: false };
  componentDidMount() {
    getNSFW(INIT_LIMIT_PHOTO)
      .then((re) => this.setState({ records: re.records, busy: false }))
      .catch((error) => this.setState({ busy: false, error }));
  }

  /**
   * Обработка "Запросить" в форме изменения количества фото
   * @param {Object} e
   */
  onSubmitChangeLimit = (e) => {
    e.preventDefault();
    // Получить значение limit из формы по event.target
    const { value } = e.target.limit;
    const limit = +value;
    if (isNaN(limit) || limit < 0 || limit > 50) {
      return;
    }
    this.setState({ busy: true, records: [] });
    getNSFW(limit).then((re) =>
      this.setState({ records: re.records, busy: false, sended: false })
    );
  };

  onClickSend = (selectedIdsRecord) => {
    const selectedRecords = this.state.records.reduce((acc, record) => {
      if (selectedIdsRecord.indexOf(record.url) > -1) {
        acc.push(record);
      }
      return acc;
    }, []);
    this.setState({ busy: true });
    sendFriday(selectedRecords)
      .then(() => {
        this.setState({ busy: false, sended: true });
      })
      .catch((error) => this.setState({ busy: false, error }));
  };

  render() {
    const { busy, error, records, sended } = this.state;
    return (
      <Container maxWidth="lg">
        <HeaderPage title="Рассылка выбранных фото" />
        <ChangeLimit onSubmit={this.onSubmitChangeLimit} busy={busy} />
        {error && <Error message={error} success={false} />}
        {sended && <Error message="Отправлено боту" success={true} />}
        <ListPictures
          records={records}
          onClickSend={this.onClickSend}
          busy={busy}
        />
        <Backdrop open={busy}></Backdrop>
      </Container>
    );
  }
}
