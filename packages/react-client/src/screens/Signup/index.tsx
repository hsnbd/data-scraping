import * as React from 'react';
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import apiEndpoints from '../../constants/api-endpoints';
import { AppDispatch } from '../../contexts/AppContext';
import { loadAuthUser } from '../../contexts/dispatchers';
import requestManager from '../../lib/requestManager';

interface SignupResponse {
  access_token: string;
}

const SignupScreen = (): React.JSX.Element => {
  const dispatch = useContext(AppDispatch);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    requestManager<SignupResponse>('post', apiEndpoints.Signup, {
      // eslint-disable-next-line camelcase
      data: { email: data.get('email'), password: data.get('password'), full_name: data.get('full_name') },
    })
      .then((responseData: SignupResponse) => {
        sessionStorage.setItem('access_token', responseData.access_token);
        loadAuthUser(dispatch)
          .then(() => {
            navigate('/keywords');
          })
          .catch(() => {});
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign up
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField autoComplete="given-name" name="full_name" required fullWidth id="full_name" label="Full Name" />
          </Grid>
          <Grid item xs={12}>
            <TextField required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />
          </Grid>
        </Grid>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign Up
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <NavLink to="/login">Already have an account? Sign in</NavLink>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SignupScreen;
