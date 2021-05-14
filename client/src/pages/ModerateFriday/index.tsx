import { FC } from "react";
import Container from "@material-ui/core/Container";

import { createStore, ModerateStoreContext } from "../../mobx/moderateFriday";

import HeaderPage from "../../components/HeaderPage";
import Header from "../../units/ModerateFriday/HeaderModerate/";
import Content from "../../units/ModerateFriday/Content/Content";
import Toolbar from "../../units/ModerateFriday/ToolbarModerate/ToolbarModerate";
import StatusBar from "../../units/ModerateFriday/StatusBar/StatusBar";

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
