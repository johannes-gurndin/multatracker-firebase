import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { addMulta, createPlayer, updatePlayer } from '../../firebase/firestore';
import { PLAYERS_ENUM } from '../../pages/teams/[teamId]';

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
    multa: ""
};

/* 
 Dialog to input receipt information
 
 props:
  - edit - the player for the multa
  - teamId - the id of the team
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
 */
export default function MultaDialog(props) {
    const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdd, setIsAdd] = useState(props.action === PLAYERS_ENUM.multaAdd)

    // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
    useEffect(() => {
        if (props.showDialog) {
            setFormFields(DEFAULT_FORM_STATE);
            setIsAdd(props.action === PLAYERS_ENUM.multaAdd);
        }
    }, [props.edit, props.showDialog])

    // Check whether any of the form fields are unedited
    const isDisabled = () => formFields.multa.length === 0

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
        console.log(formFields.multa + ' fir ' + props.player.id)
        setIsSubmitting(true);

        try {
            if (isAdd) {
                await addMulta(props.player.id, props.teamId, +formFields.multa);
            } else {
                await addMulta(props.player.id, props.teamId, -formFields.multa);
            }
            props.onSuccess(isAdd ? PLAYERS_ENUM.multaAdd : PLAYERS_ENUM.multaPaid);
        } catch (error) {
            props.onError(isAdd ? PLAYERS_ENUM.multaAdd : PLAYERS_ENUM.multaPaid);
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
               Multa {isAdd ? "Aufschreibn" : "Zouln"}
            </DialogTitle>
            <DialogContent>
                <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
                    {isAdd ? "Aufschreibn fir" : "Zouln tuat"} {props.player.name}
                </Typography>
                <TextField color="tertiary" label="Multa (in Euro)" variant="standard" fullWidth margin="dense" value={formFields.name} onChange={(event) => updateFormField(event, 'multa')} />
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