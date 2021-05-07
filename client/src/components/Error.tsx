import { FC } from "react";
import MuiAlert, { AlertProps, Color } from "@material-ui/lab/Alert";

type Props = {
  message: string;
  success?: boolean;
  severity?: Color;
};

const Alert: FC<AlertProps> = (props) => (
  <MuiAlert elevation={6} variant="filled" {...props} />
);

const Error: FC<Props> = ({ message, success, severity }) => {
  const status = !!severity ? severity : success ? "success" : "error";
  return <Alert severity={status}>{message}</Alert>;
};

export default Error;
