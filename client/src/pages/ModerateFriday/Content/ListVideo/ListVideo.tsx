import { observer } from "mobx-react-lite";
import Grid from "@material-ui/core/Grid";

import { useModerateStore } from "mobx/moderateFriday";

import VideoContent from "./VideoContent/VideoContent";
import CheckMaterial from "components/CheckMaterial/CheckMaterial";

const ListVideo = () => {
  const { list } = useModerateStore();
  console.log(`list`, list);
  return (
    <>
      {list.map((record) => {
        const { url = "", title, checked, urlAudio } = record;
        return (
          <Grid key={url} item xs={12} sm={6} xl={4} md={4}>
            <figure>
              <VideoContent url={url} urlAudio={urlAudio} title={title} />
              <CheckMaterial url={url} title={title} checked={checked} />
            </figure>
          </Grid>
        );
      })}
    </>
  );
};

export default observer(ListVideo);
