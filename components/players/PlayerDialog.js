import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { createPlayer, updatePlayer } from '../../firebase/firestore';
import { PLAYERS_ENUM } from '../../pages/teams/[teamId]';

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
    name: ""
};

/* 
 Dialog to input receipt information
 
 props:
  - edit - the player to edit
  - teamId - the id of the team
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
 */
export default function PlayerDialog(props) {
    const isEdit = Object.keys(props.edit).length > 0;
    const [formFields, setFormFields] = useState(isEdit ? props.edit : DEFAULT_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
    useEffect(() => {
        if (props.showDialog) {
            setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
        }
    }, [props.edit, props.showDialog])

    // Check whether any of the form fields are unedited
    const isDisabled = () => formFields.name.length === 0

    // Update given field in the form
    const updateFormField = (event, field) => {
        setFormFields(prevState => ({ ...prevState, [field]: event.target.value }))
    }

    const closeDialog = () => {
        setIsSubmitting(false);
        props.onCloseDialog();
    }

    // Store receipt information to Storage and Firestore
    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (isEdit) {
                await updatePlayer(formFields.id, formFields.name);
            } else {
                await createPlayer(formFields.name, props.teamId);
            }
            props.onSuccess(isEdit ? PLAYERS_ENUM.edit : PLAYERS_ENUM.add);
        } catch (error) {
            props.onError(isEdit ? PLAYERS_ENUM.edit : PLAYERS_ENUM.add);
        }

        // Clear all form data
        closeDialog();
    };

    return (
        <Dialog
            onClose={closeDialog}
            open={props.showDialog}
            component="form">
            <DialogTitle>
                {isEdit ? "EDIT" : "CREATE"} PLAYER
            </DialogTitle>
            <DialogContent>
                <TextField color="tertiary" label="Player name" variant="standard" fullWidth margin="dense" value={formFields.name} onChange={(event) => updateFormField(event, 'name')} />
            </DialogContent>
            <DialogActions>
                {isSubmitting ?
                    <Button color="secondary" variant="contained" disabled={true}>
                        Submitting...
                    </Button> :
                    <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabled()}>
                        Submit
                    </Button>}
            </DialogActions>
        </Dialog>
    )
}