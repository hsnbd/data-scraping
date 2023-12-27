import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import AppContext from '../../contexts/AppContext';

const HomeScreen = (): React.JSX.Element => {
  const { authUser } = useContext(AppContext);
  const navigate = useNavigate();

  const onClickGetStarted = useCallback(() => {
    if (!authUser) {
      navigate('/login');
    } else {
      navigate('/keywords');
    }
  }, [authUser, navigate]);

  return (
    <Grid container>
      <Grid
        item
        md={12}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '90vh',
        }}
      >
        <Box>
          <Typography variant={'h1'}>{authUser && authUser?.fullName ? `Hi ${authUser.fullName}` : 'Welcome'}</Typography>
        </Box>
        <Box>
          <Typography variant={'body1'}>Upload your keywords CSV and get google search result reports</Typography>
        </Box>
        <Box sx={{ mt: 10 }}>
          <Button variant={'contained'} color={'secondary'} onClick={onClickGetStarted}>
            Get Started
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default HomeScreen;
