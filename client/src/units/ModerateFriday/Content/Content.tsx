import { observer } from "mobx-react-lite";
import Grid from "@material-ui/core/Grid";

import { useModerateStore } from "../../../mobx/moderateFriday";

import GridContainer from "../../../components/GridContainer/GridContainer";
import ListPhotos from "./ListPhotos/ListPhotos";
import ListVideo from "./ListVideo/ListVideo";

const Content = () => {
  const { typeMailing } = useModerateStore();
  if (typeMailing === "photo") {
    return (
      <GridContainer>
        <ListPhotos />
      </GridContainer>
    );
  }
  if (typeMailing === "video") {
    return (
      <Grid container spacing={3}>
        <ListVideo />
      </Grid>
    );
  }
  return <div></div>;
};

export default observer(Content);
