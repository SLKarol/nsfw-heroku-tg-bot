import Grid from "@material-ui/core/Grid";

import CountCheck from "./CountCheck";
import SendFriday from "./SendFriday";

const Toolbar = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <CountCheck />
      </Grid>
      <Grid item xs={6}>
        <SendFriday />
      </Grid>
    </Grid>
  );
};

export default Toolbar;
