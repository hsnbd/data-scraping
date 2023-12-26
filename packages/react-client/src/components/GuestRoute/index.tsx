import React from 'react';

interface GuestRouteProps {
  children: React.ReactElement;
}

const GuestRoute = ({ children }: GuestRouteProps): React.JSX.Element => {
  // const { authUser } = useContext(AppContext);
  //
  // if (authUser) {
  //   return <Navigate to={'/'} replace />;
  // }

  return children;
};

export default GuestRoute;
