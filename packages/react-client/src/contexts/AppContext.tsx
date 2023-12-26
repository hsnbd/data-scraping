import { Context, createContext } from 'react';

import { initialStates } from './reducers';
import { AuthUser } from './types';

export interface IAppContext {
  initialPath: string;
  authUser: AuthUser | null;
  loading: boolean;
  notifications: never[];
}

const AppContext: Context<IAppContext> = createContext(initialStates);

export default AppContext;
