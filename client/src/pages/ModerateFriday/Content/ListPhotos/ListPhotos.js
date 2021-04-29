import { observer } from "mobx-react-lite";

import { useModerateStore } from "mobx/moderateFriday";

import Photo from "./Photo";
import CheckPhoto from "./CheckPhoto";

const ListPhotos = () => {
  const { list } = useModerateStore();
  return (
    <>
      {list.map((record) => {
        const { url, title, checked } = record;
        return (
          <figure key={url}>
            <Photo url={url} title={title} />
            <CheckPhoto title={title} checked={checked} url={url} />
          </figure>
        );
      })}
    </>
  );
};

export default observer(ListPhotos);
