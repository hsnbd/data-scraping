import React, { Context, createContext } from 'react';

import { ActionTypes } from './actions';
import { initialStates } from './reducers';
import { AuthUser } from './types';

export interface IAppContext {
  initialPath: string;
  authUser: AuthUser | null;
  loading: boolean;
  notifications: never[];
}

const AppContext: Context<IAppContext> = createContext(initialStates);
export const AppDispatch = createContext<React.Dispatch<ActionTypes>>(() => {});
export default AppContext;
