import styles from "./index.module.css";
import Article from "./Article";

function Anecdotes({ list, onCheck, selected }) {
  return (
    <div className={styles.grid}>
      {list.map((record) => (
        <Article
          {...record}
          key={record.id}
          onCheck={onCheck}
          selected={selected}
        />
      ))}
    </div>
  );
}

export default Anecdotes;
