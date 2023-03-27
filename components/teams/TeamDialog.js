import { Button, Dialog, DialogActions, DialogContent, TextField, DialogTitle  } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../firebase/auth';
import { addTeam, addTeamAdmin, updateTeam } from '../../firebase/firestore';
import { TEAMS_ENUM } from '../../pages/teams';

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
    name: "",
    color: ""
};

/* 
 Dialog to input receipt information
 
 props:
  - edit - the team to edit
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
 */
export default function TeamDialog(props) {
    const isEdit = Object.keys(props.edit).length > 0;
    const { authUser } = useAuth();
    const [formFields, setFormFields] = useState(isEdit ? props.edit : DEFAULT_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
    useEffect(() => {
        if (props.showDialog) {
            setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
        }
    }, [props.edit, props.showDialog])

    // Check whether any of the form fields are unedited
    const isDisabled = () => formFields.name.length === 0 || formFields.color.length === 0;

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
                await updateTeam(formFields.id, formFields.name, formFields.color);
            } else {
                // Adding receipt
                // Store image into Storage
                const teamId = await addTeam(formFields.name, formFields.color, authUser.uid);
            }
            props.onSuccess(isEdit ? TEAMS_ENUM.edit : TEAMS_ENUM.add);
        } catch (error) {
            props.onError(isEdit ? TEAMS_ENUM.edit : TEAMS_ENUM.add);
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
                {isEdit ? "EDIT" : "ADD"} TEAM
            </DialogTitle>
            <DialogContent>
                <TextField color="tertiary" label="Team name" variant="standard" fullWidth margin="dense" value={formFields.name} onChange={(event) => updateFormField(event, 'name')} />
                <br/>
                <TextField color="tertiary" label="Team color" variant="standard" fullWidth margin="dense" value={formFields.color} onChange={(event) => updateFormField(event, 'color')} />
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