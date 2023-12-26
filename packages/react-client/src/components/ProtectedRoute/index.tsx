import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import AppContext from '../../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): React.JSX.Element => {
  const { authUser } = useContext(AppContext);

  if (!authUser) {
    return <Navigate to={'/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
