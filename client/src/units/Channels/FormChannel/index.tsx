import { FC } from "react";
import { observer } from "mobx-react-lite";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { useChannelStore } from "../../../mobx/channels";
import { createStore, FormStoreContext } from "../../../mobx/crUpChannel";

import FormDialog from "./FormDialog";
import DialogControls from "./DialogControls";

const FormChannel: FC = () => {
  const { operation, selectedRecord, setOperation } = useChannelStore();

  if (operation === "add" || operation === "edit") {
    const formStore = createStore(
      selectedRecord.name,
      selectedRecord.withVideo,
      selectedRecord.moderationRequired
    );
    const handleClose = () => setOperation("view");
    return (
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">Reddit-канал</DialogTitle>
        <FormStoreContext.Provider value={formStore}>
          <DialogContent>
            <FormDialog />
          </DialogContent>
          <DialogActions>
            <DialogControls handleClose={handleClose} />
          </DialogActions>
        </FormStoreContext.Provider>
      </Dialog>
    );
  }
  return null;
};

export default observer(FormChannel);
