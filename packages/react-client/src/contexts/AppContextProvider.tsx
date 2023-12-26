import React, { ReactNode, useEffect, useReducer } from 'react';

import { ActionTypes } from './actions';
import AppContext, { IAppContext } from './AppContext';
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
  }, []);

  return (
    <AppContext.Provider
      value={
        {
          ...contextState,
          contextDispatch,
        } as never
      }
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
