import React from 'react';
import { useRoutes } from 'react-router-dom';

import 'dummy.css';
import 'assets/stylesheets/application.css';

import routes from 'routes';

const App = (): React.JSX.Element => {
  const appRoutes = useRoutes(routes);

  return <>{appRoutes}</>;
};

export default App;
