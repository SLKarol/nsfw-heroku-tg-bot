import Container from "@material-ui/core/Container";

import { createStore, ModerateStoreContext } from "mobx/moderateFriday";

import HeaderPage from "components/HeaderPage";
import Header from "./Header/Header";
import Content from "./Content/Content";
import Toolbar from "./Toolbar/Toolbar";
import FetchStatus from "./FetchStatus/FetchStatus";

const ModerateFriday = () => {
  const store = createStore();

  return (
    <Container maxWidth="lg">
      <HeaderPage title="Модерация выпуска" />
      <ModerateStoreContext.Provider value={store}>
        <Header />
        <Toolbar />
        <FetchStatus />
        <Content />
      </ModerateStoreContext.Provider>
    </Container>
  );
};

export default ModerateFriday;
