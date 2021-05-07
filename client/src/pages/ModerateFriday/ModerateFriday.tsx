import { FC } from "react";
import Container from "@material-ui/core/Container";

import { createStore, ModerateStoreContext } from "mobx/moderateFriday";

import HeaderPage from "components/HeaderPage";
import Header from "./Header/Header";
import Content from "./Content/Content";
import Toolbar from "./Toolbar/Toolbar";
import StatusBar from "./StatusBar/StatusBar";

const ModerateFriday: FC = () => {
  const store = createStore();

  return (
    <Container maxWidth="lg">
      <HeaderPage title="Модерация выпуска" />
      <ModerateStoreContext.Provider value={store}>
        <Header />
        <Toolbar />
        <StatusBar />
        <Content />
      </ModerateStoreContext.Provider>
    </Container>
  );
};

export default ModerateFriday;
