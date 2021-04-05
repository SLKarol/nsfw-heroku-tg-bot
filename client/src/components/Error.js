import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Error = ({ message, success, severity }) => {
  const status = !!severity ? severity : success ? "success" : "error";
  return <Alert severity={status}>{message}</Alert>;
};

export default Error;
