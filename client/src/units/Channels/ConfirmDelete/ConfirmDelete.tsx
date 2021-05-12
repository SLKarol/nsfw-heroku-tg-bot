import { FC } from "react";
import { observer } from "mobx-react-lite";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { useChannelStore } from "../../../mobx/channels";

import ConfirmButtons from "./ConfirmButtons";

const ConfirmDelete: FC = () => {
  const { selectedRecord, setOperation } = useChannelStore();

  const handleClose = () => setOperation("view");
  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle id="form-dialog-title">
        Удалить Reddit-канал из списка
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Удалить из списка канал <strong>{selectedRecord.name}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <ConfirmButtons />
      </DialogActions>
    </Dialog>
  );
};

export default observer(ConfirmDelete);
