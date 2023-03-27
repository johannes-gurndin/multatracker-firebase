import { async } from "@firebase/util";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const TEAMS_COLLECTION = "teams";
const PLAYERS_COLLECTION = "players";

// TEAM Example
const team = {
    id: 'abc',
    name: 'Freizeit',
    color: 'Blau Weiss',
    amdins: [
        'adminID1',
        'adminID2'
    ]
}

// PLAYER Example
const player = {
    id: 'abc',
    name: 'Johannes Gurndin',
    teams: [
        {
            id: 'teamId1',
            amountDue: 123, // Amount that still needs to be paid
            totalMulta: 150 // Total Multa of all time for this team
        },
        {
            id: 'teamId2',
            amountDue: 134, // Amount that still needs to be paid
            totalMulta: 1123 // Total Multa of all time for this team
        }
    ],
    teamIds: [ // Array of Ids needed for query
        "teamId1",
        "teamId2"
    ]
}

export async function createPlayer(name, teamId) {
    const ref = await addDoc(collection(db, PLAYERS_COLLECTION), {name, teams: [{id: teamId, amountDue: 0, totalMulta: 0}], teamIds: [teamId]})
    return ref.id;
}

export async function addPlayerToTeam(playerId, teamId) {
    const player = await getPlayer(playerId);
    let playerTeams = player.teams;
    let palyerTeamIds = player.teamIds;
    playerTeams.push({id: teamId, amountDue: 0, totalMulta: 0})
    palyerTeamIds.push(teamId);

    updateDoc(doc(db, PLAYERS_COLLECTION, playerId), {teams: playerTeams, teamIds: palyerTeamIds});
}

export async function getPlayer(playerId) {
    const playerSnap = await getDoc(doc(db, PLAYERS_COLLECTION, playerId));
    if (playerSnap.exists()) {
        return {...playerSnap.data(), id: playerSnap.id};
    }
    return null;
}

export async function updatePlayer(playerId, name) {
    updateDoc(doc(db, PLAYERS_COLLECTION, playerId), {name});
}

export function deletePlayer(id) {
    deleteDoc(doc(db, PLAYERS_COLLECTION, id));
}

export async function addMulta(playerId, teamId, multa) {
    const player = await getPlayer(playerId);
    if (player) {
        const teams = player.teams;
        teams.map((team) => {
            if(team.id == teamId) {
                team.amountDue += multa;
                if (multa > 0)
                    team.totalMulta += multa;
            }
        });
        updateDoc(doc(db, PLAYERS_COLLECTION, playerId), {teams})
    } 
}

export async function addTeam(name, color, userId) {
    const ref = await addDoc(collection(db, TEAMS_COLLECTION), {name, color, admins: [userId]});
    return ref.id;
}

export function updateTeam(id, name, color) {
    updateDoc(doc(db, TEAMS_COLLECTION, id), {name, color});
}

export function deleteTeam(id) {
    deleteDoc(doc(db, TEAMS_COLLECTION, id));
}

export function addTeamAdmin(team, newAdminId) {
    const newAdmins = team.admins;
    newAdmins.push(newAdminId);
    updateDoc(doc(db, TEAMS_COLLECTION, team.id), {admins: newAdmins})   
}

export async function getTeamForUser(teamId, userId, setTeam, setIsLoadingTeam) {
    const qTeam = query(doc(db, TEAMS_COLLECTION, teamId));
    

    const unsubscribe = onSnapshot(qTeam, async (querySnapshot) => {
        const team = {...querySnapshot.data(), id: querySnapshot.id};

        if (team.admins != null && team.admins.indexOf(userId) !== -1) {
            setTeam(team);
        }
        setIsLoadingTeam(false);
    });
    return unsubscribe;
}

export async function getTeamsForUser(userId, setTeams, setIsLoading) {
    const qTeams = query(collection(db, TEAMS_COLLECTION), where("admins", "array-contains", userId));
    const unsubscribe = onSnapshot(qTeams, async (teamsSnapshot) => {
        let allTeams = [];
        
        for (const team of teamsSnapshot.docs) {
            await allTeams.push({...team.data(), id: team.id});
        }
        setTeams(allTeams);
        setIsLoading(false);
    });
    return unsubscribe;
}

export async function getPlayersOfTeam(teamId, setPlayers, setIsLoading) {
    const qPlayers = query(collection(db, PLAYERS_COLLECTION), where("teamIds", "array-contains", teamId));
    const unsubscribe = onSnapshot(qPlayers, async (playerSnap) => {
        let allPlayers = [];

        for (const player of playerSnap.docs) {
            await allPlayers.push({...player.data(), id: player.id});
        }
        setPlayers(allPlayers);
        setIsLoading(false);
    });
    return unsubscribe;
}