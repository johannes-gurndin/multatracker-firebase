import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, Divider, IconButton, Link, Snackbar, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import TeamDialog from '../../components/teams/TeamDialog';
import { useAuth } from '../../firebase/auth';
import { deleteTeam, getTeamsForUser } from '../../firebase/firestore';

const ADD_SUCCESS = "Team was successfully added!";
const ADD_ERROR = "Team was not successfully added!";
const EDIT_SUCCESS = "Team was successfully updated!";
const EDIT_ERROR = "Team was not successfully updated!";
const DELETE_SUCCESS = "Team successfully deleted!";
const DELETE_ERROR = "Team not successfully deleted!";

// Enum to represent different states of teams
export const TEAMS_ENUM = Object.freeze({
    none: 0,
    add: 1,
    edit: 2,
    delete: 3,
});

const SUCCESS_MAP = {
    [TEAMS_ENUM.add]: ADD_SUCCESS,
    [TEAMS_ENUM.edit]: EDIT_SUCCESS,
    [TEAMS_ENUM.delete]: DELETE_SUCCESS
}

const ERROR_MAP = {
    [TEAMS_ENUM.add]: ADD_ERROR,
    [TEAMS_ENUM.edit]: EDIT_ERROR,
    [TEAMS_ENUM.delete]: DELETE_ERROR
}
export default function Teams() {
    const { authUser } = useAuth();
    const [action, setAction] = useState(TEAMS_ENUM.none);

    // State involved in loading, setting, deleting, and updating teams
    const [isLoadingTeams, setIsLoadingTeams] = useState(true);
    const [teams, setTeams] = useState([]);
    const [deleteTeamId, setDeleteTeamId] = useState("");
    const [updateTeam, setUpdateTeam] = useState({});

    // State involved in snackbar
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
    const [showErrorSnackbar, setErrorSnackbar] = useState(false);

    // Get teams once user is logged in
    useEffect(async () => {
        if (authUser) {
            const unsub = await getTeamsForUser(authUser.uid, setTeams, setIsLoadingTeams);
            return () => unsub();
        }
    }, [authUser])

    // Sets appropriate snackbar message on whether @isSuccess and updates shown teams if necessary
    const onResult = async (receiptEnum, isSuccess) => {
        setSnackbarMessage(isSuccess ? SUCCESS_MAP[receiptEnum] : ERROR_MAP[receiptEnum]);
        isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
        setAction(TEAMS_ENUM.none);
    }

    // For all of the onClick functions, update the action and fields for updating

    const onClickAdd = () => {
        setAction(TEAMS_ENUM.add);
        setUpdateTeam({});
    }

    const onUpdate = (team) => {
        setAction(TEAMS_ENUM.edit);
        setUpdateTeam(team);
    }

    const onClickDelete = (id) => {
        setAction(TEAMS_ENUM.delete);
        setDeleteTeamId(id);
    }

    const resetDelete = () => {
        setAction(TEAMS_ENUM.none);
        setDeleteTeamId("");
    }

    const onDelete = async () => {
        let isSucceed = true;
        try {
            deleteTeam(deleteTeamId);
        } catch (error) {
            isSucceed = false;
        }
        resetDelete();
        onResult(TEAMS_ENUM.delete, isSucceed);
    }

    return ((isLoadingTeams) ?
        <CircularProgress color="inherit" sx={{ marginLeft: '50%', marginTop: '25%' }} />
        :
        <div>
            <Head>
                <title>Teams</title>
            </Head>
            <Container>
                <Snackbar open={showSuccessSnackbar} autoHideDuration={1500} onClose={() => setSuccessSnackbar(false)}
                    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
                    <Alert onClose={() => setSuccessSnackbar(false)} severity="success">{snackbarMessage}</Alert>
                </Snackbar>
                <Snackbar open={showErrorSnackbar} autoHideDuration={1500} onClose={() => setErrorSnackbar(false)}
                    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
                    <Alert onClose={() => setErrorSnackbar(false)} severity="error">{snackbarMessage}</Alert>
                </Snackbar>
                <Stack direction="row" sx={{ paddingTop: "1.5em" }}>
                    <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
                        TEAMS
                    </Typography>
                    <IconButton aria-label="add" color="secondary" onClick={onClickAdd}>
                        <AddIcon />
                    </IconButton>
                </Stack>
                {teams.map((team) => (
                    <div key={team.id}>
                        <Divider light />
                        <Stack direction="row" sx={{ paddingTop: "1.5em" }} justifyContent="space-between" className='teamItem'>
                            <Link href={'/teams/' + team.id}>
                                <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
                                    {team.name} - {team.color}
                                </Typography>
                            </Link>
                            <div>
                                <IconButton aria-label="edit" color="secondary" onClick={() => onUpdate(team)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton aria-label="edit" color="secondary" onClick={() => onClickDelete(team.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </Stack>
                    </div>
                )
                )}
            </Container>
            <TeamDialog edit={updateTeam}
                showDialog={action === TEAMS_ENUM.add || action === TEAMS_ENUM.edit}
                onError={(teamEnum) => onResult(teamEnum, false)}
                onSuccess={(teamEnum) => onResult(teamEnum, true)}
                onCloseDialog={() => setAction(TEAMS_ENUM.none)}>
            </TeamDialog>
            <Dialog open={action === TEAMS_ENUM.delete} onClose={resetDelete}>
                <Typography variant="h4">DELETE TEAM</Typography>
                <DialogContent>
                    <Alert severity="error">This will permanently delete your team!</Alert>
                </DialogContent>
                <DialogActions sx={{ padding: '0 24px 24px' }}>
                    <Button color="secondary" variant="outlined" onClick={resetDelete}>
                        Cancel
                    </Button>
                    <Button color="secondary" variant="contained" onClick={onDelete} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}