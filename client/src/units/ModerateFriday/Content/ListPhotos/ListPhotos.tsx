import { observer } from "mobx-react-lite";

import { useModerateStore } from "../../../../mobx/moderateFriday";

import Photo from "./Photo";
import CheckMaterial from "../../../../components/CheckMaterial/CheckMaterial";

const ListPhotos = () => {
  const { list } = useModerateStore();
  return (
    <>
      {list.map((record) => {
        const {
          url = "",
          title = "",
          checked,
          correctImageDimension = false,
        } = record;
        return (
          <figure key={url}>
            <Photo url={url} title={title} />
            <CheckMaterial
              title={title}
              checked={checked}
              url={url}
              correctMaterial={correctImageDimension}
            />
          </figure>
        );
      })}
    </>
  );
};

export default observer(ListPhotos);
