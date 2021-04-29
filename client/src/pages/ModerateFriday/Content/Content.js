import { observer } from "mobx-react-lite";

import { useModerateStore } from "mobx/moderateFriday";

import ListPhotos from "./ListPhotos/ListPhotos";

const Content = () => {
  const { typeMailing } = useModerateStore();
  if (typeMailing === "photo") {
    return <ListPhotos />;
  }
  if (typeMailing === "video") {
    return <div>Видео</div>;
  }
  return <div></div>;
};

export default observer(Content);
