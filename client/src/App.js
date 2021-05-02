import { Redirect } from "react-router-dom";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import { currentUserHasLogin } from "lib/user";
import styles from "./app.module.css";

function App() {
  const hasToken = currentUserHasLogin();
  if (!hasToken) {
    return <Redirect to="/signin" />;
  }
  return (
    <Container component="main" maxWidth="sm">
      <Typography>
        <div className={styles.main}>
          <Link href="/anecdotes">Рассылка выпусков БОР</Link>
          <Link href="/forcemail">Принудительная рассылка NSFW</Link>
          <Link href="/moderate">Модерация выпуска</Link>
        </div>
      </Typography>
    </Container>
  );
}

export default App;
