import React from 'react';
import { useRoutes } from 'react-router-dom';

import routes from 'routes';

const App = (): React.JSX.Element => {
  const appRoutes = useRoutes(routes);

  return <>{appRoutes}</>;
};

export default App;
