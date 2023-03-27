import { Button, Dialog, Grid, Typography } from '@mui/material';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth } from '../firebase/firebase';
import * as React from 'react';


const REDIRECT_PAGE = '/teams';

//configure firebase ui
const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: REDIRECT_PAGE,
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    GoogleAuthProvider.PROVIDER_ID,
  ]
};


export default function Home() {
  const [login, setLogin] = useState(false);

  
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Typography variant="h2" noWrap component="p" sx={{textAlign: 'center'}}>Welcome to <b>Multa Tracker</b></Typography>
          <Typography variant="h5" component="p" sx={{textAlign: 'center'}}>If you already have an Account please Login, otherwise please Register for an Account!</Typography>
        </Grid>
        <Grid item xs={2}></Grid>

        <Grid item xs={5}></Grid>
        <Grid item xs={2}>
            <Button variant='contained' color='secondary' onClick={() => setLogin(true)} sx={{width: '100%', textAlign: 'center'}}>
              Login/Register
            </Button>
        </Grid>
        <Grid item xs={5}></Grid>
      </Grid>
      <Dialog open={login} onClose={() => setLogin(false)}>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      </Dialog>
    </>
  )
}
