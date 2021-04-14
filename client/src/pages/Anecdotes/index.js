import { Component } from "react";
import Container from "@material-ui/core/Container";
import Backdrop from "@material-ui/core/Backdrop";

import { getListBashOrg, sendToTelegram } from "lib/bashOrg";
import Header from "./Header";
import Error from "components/Error";

import List from "./List";

class Anecdotes extends Component {
  state = {
    list: [],
    selected: [],
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
  onCheck = (e) => {
    const { name, checked } = e.target;
    const selectedSet = new Set(this.state.selected);
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
      (article) => selected.indexOf(article.id) > -1
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

  render() {
    const {
      list,
      selected,
      busy,
      resultOperation,
      successOperation,
    } = this.state;
    return (
      <Container maxWidth="lg">
        {!!resultOperation ? (
          <Error message={resultOperation} success={successOperation} />
        ) : null}
        <Backdrop open={busy}></Backdrop>
        <Header disable={!selected.length} onClick={this.onClickToTelegram} />
        <List list={list} onCheck={this.onCheck} selected={selected} />
      </Container>
    );
  }
}

export default Anecdotes;
