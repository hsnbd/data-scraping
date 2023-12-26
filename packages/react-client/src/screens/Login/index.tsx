import React from 'react';

import logo from 'assets/images/logo.svg';

const HomeScreen = (): React.JSX.Element => {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1>Login page</h1>
      </header>
    </div>
  );
};

export default HomeScreen;
