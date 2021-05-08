import { Component } from "react";
import Container from "@material-ui/core/Container";
import Backdrop from "@material-ui/core/Backdrop";

import { ContentRSS, BashOrgUI } from "../../types/bashOrg";
import { OnCheck } from "../../types/functions";

import { getListBashOrg, sendToTelegram } from "../../lib/bashOrg";

import Header from "./Header";
import Error from "../../components/Error";

import List from "./List";

class Anecdotes extends Component {
  state = {
    /**
     * Массив записей из БАШ
     */
    list: [] as ContentRSS[],
    /**
     * Массив выбранных ID
     */
    selected: [] as string[],
    /**
     * Признак занятости страницы
     */
    busy: true,
    resultOperation: "",
    successOperation: false,
  };
  componentDidMount() {
    getListBashOrg()
      .then((list) => {
        this.setState({ list, busy: false });
      })
      .catch((err) => {
        this.setState({
          busy: false,
          resultOperation: err,
          successOperation: false,
        });
      });
  }
  onCheck: OnCheck = (e) => {
    const { name, checked } = e.target;
    const selectedSet = new Set<string>(this.state.selected);
    if (checked) {
      selectedSet.add(name);
    } else {
      selectedSet.delete(name);
    }
    this.setState({ selected: [...selectedSet] });
  };
  onClickToTelegram = async () => {
    this.setState({ busy: true, resultOperation: "", successOperation: true });
    const { list, selected } = this.state;
    const articles = list.filter(
      (article) => selected.indexOf(article.id || "") > -1
    );
    try {
      const re = await sendToTelegram(articles);
      const { message, success } = re;
      this.setState({
        busy: false,
        resultOperation: message,
        successOperation: success,
      });
    } catch (error) {
      this.setState({
        busy: false,
        resultOperation: error,
        successOperation: false,
      });
    }
  };

  /**
   * Представляет записи БОР для выводя в UI
   * @returns
   */
  getListBashOrgContent = () => {
    const { list, selected } = this.state;
    const re = list.map<BashOrgUI>((record, idx) => {
      const { id, ...props } = record;
      return {
        ...props,
        id: id || idx.toString(),
        selected: selected.indexOf(record.id || "") > -1,
      };
    });
    return re;
  };

  render() {
    const { busy, resultOperation, successOperation, selected } = this.state;
    const bashContents = this.getListBashOrgContent();
    return (
      <Container maxWidth="lg">
        {!!resultOperation ? (
          <Error message={resultOperation} success={successOperation} />
        ) : null}
        <Backdrop open={busy}></Backdrop>
        <Header disabled={!selected.length} onClick={this.onClickToTelegram} />
        <List list={bashContents} onCheck={this.onCheck} />
      </Container>
    );
  }
}

export default Anecdotes;
