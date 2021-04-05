import { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";

import styles from "./listPictures.module.css";

import Picture from "./Picture";

export default function ListPictures({ records, onClickSend, busy }) {
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    setSelectedImages([]);
  }, [records]);

  /**
   * Обработка выбора картинки
   * @param {SyntheticEvent} e
   */
  const onChange = (e) => {
    const { name, checked } = e.target;
    const selectedSet = new Set(selectedImages);
    if (checked) {
      selectedSet.add(name);
    } else {
      selectedSet.delete(name);
    }
    setSelectedImages([...selectedSet]);
  };

  const onClick = () => onClickSend(selectedImages);

  return (
    <>
      <div className={styles.containerButton}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!selectedImages.length || busy}
          onClick={onClick}
        >
          Отправить
        </Button>
      </div>
      <div className={styles.listPictures}>
        {records.map((record) => (
          <Picture
            key={record.url}
            {...record}
            checked={selectedImages.indexOf(record.url) > -1}
            onChange={onChange}
          />
        ))}
      </div>
    </>
  );
}
