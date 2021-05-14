import Grid from "@material-ui/core/Grid";

import CountCheck from "./CountCheck";
import SendFriday from "./SendFriday";
import CheckRatio from "./CheckRatio";

const ToolbarModerate = () => {
  return (
    <Grid container spacing={2} alignItems="stretch">
      <Grid item xs={3}>
        <CountCheck />
      </Grid>
      <Grid item xs={3}>
        <CheckRatio />
      </Grid>
      <Grid item xs>
        <SendFriday />
      </Grid>
    </Grid>
  );
};

export default ToolbarModerate;
