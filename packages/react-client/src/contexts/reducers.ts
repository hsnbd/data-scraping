import { ActionTypes, UPDATE_AUTH_USER, UPDATE_AUTH_USER_NOTIFICATIONS, USER_LOADING } from './actions';
import { IAppContext } from './AppContext';

export const initialStates: IAppContext = {
  initialPath: '/',
  loading: true,
  authUser: null,
  notifications: [],
};

const RootReducers = (state = initialStates, action: ActionTypes): IAppContext => {
  switch (action.type) {
    case UPDATE_AUTH_USER: {
      return {
        ...state,
        authUser: action.payload,
      };
    }
    case UPDATE_AUTH_USER_NOTIFICATIONS: {
      return {
        ...state,
        notifications: action.payload,
      };
    }
    case USER_LOADING: {
      return {
        ...state,
        loading: action.payload,
      };
    }
    default:
      return state;
  }
};

export default RootReducers;
