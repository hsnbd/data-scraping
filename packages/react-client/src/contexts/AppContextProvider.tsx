import React, { ReactNode, useEffect, useReducer } from 'react';

import { ActionTypes } from './actions';
import AppContext, { AppDispatch, IAppContext } from './AppContext';
import { loadAuthUser } from './dispatchers';
import RootReducers, { initialStates } from './reducers';

interface IProjectContextComponent {
  children: ReactNode;
}

type IAppReducer = (prevState: IAppContext, action: ActionTypes) => IAppContext;

const AppContextProvider = ({ children }: IProjectContextComponent) => {
  const [contextState, contextDispatch] = useReducer<IAppReducer, unknown>(RootReducers, initialStates, () => initialStates);

  useEffect(() => {
    if (!contextState.authUser) {
      loadAuthUser(contextDispatch);
    }
  }, [contextState.authUser]);

  return (
    <AppContext.Provider value={contextState}>
      <AppDispatch.Provider value={contextDispatch}>{children}</AppDispatch.Provider>
    </AppContext.Provider>
  );
};

export default AppContextProvider;
