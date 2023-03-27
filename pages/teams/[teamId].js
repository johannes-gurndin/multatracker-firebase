import { Alert, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Link, Snackbar, Stack, Typography, useMediaQuery } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router'
import { useEffect } from 'react';
import { useState } from 'react';
import PlayerDialog from '../../components/players/PlayerDialog';
import { useAuth } from '../../firebase/auth';
import { deletePlayer, getPlayersOfTeam, getTeamForUser } from '../../firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/system';
import MultaDialog from '../../components/players/MultaDialog';

// Enum to represent different states of players
export const PLAYERS_ENUM = Object.freeze({
    none: 0,
    add: 1,
    edit: 2,
    delete: 3,
    multaAdd: 4,
    multaPaid: 5,
});

const spacesDesktop = [6, 2, 4, 1, 1, 8, 1, 1]
const spacesMobile = [6, 2, 4, 2, 2, 2, 2, 2]

// Snackbar messages
const ADD_SUCCESS = "Player was successfully added!";
const ADD_ERROR = "Player was not successfully added!";
const EDIT_SUCCESS = "Player was successfully updated!";
const EDIT_ERROR = "Player was not successfully updated!";
const DELETE_SUCCESS = "Player successfully deleted!";
const DELETE_ERROR = "Player not successfully deleted!";
const MULTA_SUCCESS = "Multaaaaaa!";
const MULTA_ERROR = "Oubocht! Multa nit notiert!";
const MULTA_PAID_SUCCESS = "Die Kasse dankt!";
const MULTA_PAID_ERROR = "Oubocht! Multa nit gazoult!";

const SUCCESS_MAP = {
    [PLAYERS_ENUM.add]: ADD_SUCCESS,
    [PLAYERS_ENUM.edit]: EDIT_SUCCESS,
    [PLAYERS_ENUM.delete]: DELETE_SUCCESS,
    [PLAYERS_ENUM.multaAdd]: MULTA_SUCCESS,
    [PLAYERS_ENUM.multaPaid]: MULTA_PAID_SUCCESS
}

const ERROR_MAP = {
    [PLAYERS_ENUM.add]: ADD_ERROR,
    [PLAYERS_ENUM.edit]: EDIT_ERROR,
    [PLAYERS_ENUM.delete]: DELETE_ERROR,
    [PLAYERS_ENUM.multaAdd]: MULTA_ERROR,
    [PLAYERS_ENUM.multaPaid]: MULTA_PAID_ERROR
}

const TeamDetail = () => {
    const router = useRouter()
    const { teamId } = router.query

    const { authUser } = useAuth();
    const [action, setAction] = useState(PLAYERS_ENUM.none);

    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [team, setTeam] = useState({});

    const [players, setPlayers] = useState([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);

    const [deletePlayerId, setDeletePlayerId] = useState("");
    const [updatePlayer, setUpdatePlayer] = useState({});


    // State involved in snackbar
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
    const [showErrorSnackbar, setErrorSnackbar] = useState(false);

    const spacing = useMediaQuery('(min-width:600px)') ? spacesDesktop : spacesMobile;

    useEffect(async () => {
        if (authUser) {
            const unsub = await getTeamForUser(teamId, authUser.uid, setTeam, setIsLoadingTeam);
            const unsubPlayers = await getPlayersOfTeam(teamId, setPlayers, setIsLoadingPlayers);
            return () => {
                unsub();
                unsubPlayers();
            };


        }
    }, [authUser])



    // Sets appropriate snackbar message on whether @isSuccess and updates shown players if necessary
    const onResult = async (receiptEnum, isSuccess) => {
        setSnackbarMessage(isSuccess ? SUCCESS_MAP[receiptEnum] : ERROR_MAP[receiptEnum]);
        isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
        setAction(PLAYERS_ENUM.none);
    }

    // For all of the onClick functions, update the action and fields for updating

    const onClickAdd = () => {
        setAction(PLAYERS_ENUM.add);
        setUpdatePlayer({});
    }

    const onUpdate = (player) => {
        setAction(PLAYERS_ENUM.edit);
        setUpdatePlayer(player);
    }

    const onAddMulta = (player) => {
        setUpdatePlayer(player);
        setAction(PLAYERS_ENUM.multaAdd);
    }

    const onPayMulta = (player) => {
        setUpdatePlayer(player);
        setAction(PLAYERS_ENUM.multaPaid);
    }

    const onClickDelete = (id) => {
        setAction(PLAYERS_ENUM.delete);
        setDeletePlayerId(id);
    }

    const resetDelete = () => {
        setAction(PLAYERS_ENUM.none);
        setDeletePlayerId("");
    }

    const onDelete = async () => {
        let isSucceed = true;
        try {
            deletePlayer(deletePlayerId);

        } catch (error) {
            isSucceed = false;
        }
        resetDelete();
        onResult(PLAYERS_ENUM.delete, isSucceed);
    }

    return ((isLoadingTeam || isLoadingPlayers) ?
        <CircularProgress color="inherit" sx={{ marginLeft: '50%', marginTop: '25%' }} />
        :
        <>
            <div>
                <Head>
                    <title>Players of {team.name}</title>
                </Head>
                <Box>
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
                            PLAYERS OF {team.name}
                        </Typography>
                        <IconButton aria-label="add" color="secondary" onClick={onClickAdd}>
                            <AddIcon />
                        </IconButton>
                    </Stack>
                    <Box sx={{ height: '80vh', overflow: 'hidden', overflowY: 'scroll', width: '100%' }}>
                        {players.map((player) => (
                            <div key={player.id}>
                                <Divider light />
                                <Stack direction="row" sx={{ paddingTop: "1.5em" }} className='playerItem'>
                                    <Grid container sx={{alignItems: 'center'}}>
                                        <Grid item xs={spacing[0]}>
                                            <Link href={'/players/' + player.id}>
                                                <Typography variant="h6" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
                                                    {player.name}
                                                </Typography>
                                            </Link>
                                        </Grid>
                                        <Grid item xs={spacing[1]}>
                                            <Typography variant="h6" sx={{ lineHeight: 2, color: 'green', textAlign: 'right'}}>
                                                {player.teams.filter(t => t.id = teamId)[0].amountDue} €
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={spacing[2]}>
                                            <Grid container>
                                                <Grid item xs={spacing[3]}>
                                                    <IconButton aria-label="edit" style={{color: 'green'}} size="small" onClick={() => onAddMulta(player)}>
                                                        <AddIcon />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={spacing[4]}>
                                                    <IconButton aria-label="edit" style={{color: 'red'}} size="small" onClick={() => onPayMulta(player)}>
                                                        <RemoveIcon />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={spacing[5]}></Grid>
                                                <Grid item xs={spacing[6]}>
                                                    <IconButton aria-label="edit" color="secondary" size="small" onClick={() => onUpdate(player)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={spacing[7]}>
                                                    <IconButton aria-label="delete" color="secondary" size="small" onClick={() => onClickDelete(player.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </div>)
                        )}
                    </Box>
                </Box>

                <PlayerDialog
                    edit={updatePlayer}
                    teamId={teamId}
                    showDialog={action === PLAYERS_ENUM.add || action === PLAYERS_ENUM.edit}
                    onError={(res) => onResult(res, false)}
                    onSuccess={(res) => onResult(res, true)}
                    onCloseDialog={() => setAction(PLAYERS_ENUM.none)}>
                </PlayerDialog>
                <MultaDialog
                    player={updatePlayer}
                    teamId={teamId}
                    action={action}
                    showDialog={action === PLAYERS_ENUM.multaAdd || action === PLAYERS_ENUM.multaPaid}
                    onError={(res) => onResult(res, false)}
                    onSuccess={(res) => onResult(res, true)}
                    onCloseDialog={() => setAction(PLAYERS_ENUM.none)}>
                </MultaDialog>
                <Dialog open={action === PLAYERS_ENUM.delete} onClose={resetDelete}>
                    <Typography variant="h4">DELETE PLAYER</Typography>
                    <DialogContent>
                        <Alert severity="error">This will permanently delete your player!</Alert>
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
        </>
    );
}

export default TeamDetail;