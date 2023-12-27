import React from 'react';
import { useRoutes } from 'react-router-dom';

import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import routes from 'routes';

import AppHeader from './components/AppHeader';

const defaultTheme = createTheme();

const App = (): React.JSX.Element => {
  const appRoutes = useRoutes(routes);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <AppHeader />
        {appRoutes}
      </Container>
    </ThemeProvider>
  );
};

export default App;
