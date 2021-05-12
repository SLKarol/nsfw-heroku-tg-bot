import { FC } from "react";
import Container from "@material-ui/core/Container";

import { createStore, ChannelsStoreContext } from "../../mobx/channels";

import ListChannels from "../../units/Channels/ListChannels/ListChannels";
import HeaderPage from "../../components/HeaderPage";
import ChannelsToolbar from "./ChannelsToolbar";
import FormChannel from "../../units/Channels/FormChannel";
import ConfirmDelChannel from "../../units/Channels/ConfirmDelete";
import Error from "../../units/Channels/Error";

const store = createStore();

const Channels: FC = () => {
  return (
    <Container maxWidth="lg">
      <HeaderPage title="Список reddit-каналов" />
      <ChannelsStoreContext.Provider value={store}>
        <ChannelsToolbar />
        <Error />
        <ListChannels />
        <FormChannel />
        <ConfirmDelChannel />
      </ChannelsStoreContext.Provider>
    </Container>
  );
};

export default Channels;
