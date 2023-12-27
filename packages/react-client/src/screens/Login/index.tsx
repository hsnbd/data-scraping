import * as React from 'react';
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import apiEndpoints from '../../constants/api-endpoints';
import { AppDispatch } from '../../contexts/AppContext';
import { loadAuthUser } from '../../contexts/dispatchers';
import requestManager from '../../lib/requestManager';

interface LoginResponse {
  access_token: string;
}

const LoginScreen = (): React.JSX.Element => {
  const dispatch = useContext(AppDispatch);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    requestManager<LoginResponse>('post', apiEndpoints.Login, {
      data: { email: data.get('email'), password: data.get('password') },
    })
      .then((responseData: LoginResponse) => {
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
        Sign in
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <NavLink to="/signup">{"Don't have an account? Sign Up"}</NavLink>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoginScreen;
