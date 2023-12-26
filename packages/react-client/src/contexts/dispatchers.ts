import { ActionTypes, UPDATE_AUTH_USER, UPDATE_AUTH_USER_NOTIFICATIONS, userLoading } from './actions';
import requestManager from '../lib/requestManager';

interface ProfileResponse {
  id: number;
  email: string;
  full_name: string;
}

export const loadAuthUser = async (dispatch: (val: ActionTypes) => void) => {
  dispatch(userLoading(true));
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      throw new Error('Access token is null');
    }

    const authUser = (await requestManager('get', 'http://localhost:4000/profile', {
      headers: { authorization: `Bearer ${token}` },
    })) as unknown as ProfileResponse;

    dispatch({
      type: UPDATE_AUTH_USER,
      payload: {
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.full_name,
      },
    });
  } catch (err: unknown) {
    dispatch({
      type: UPDATE_AUTH_USER,
      payload: null,
    });
  } finally {
    dispatch(userLoading(false));
  }
};

export const loadAuthUserNotifications = async (dispatch: (val?: ActionTypes) => void) => {
  try {
    dispatch({
      type: UPDATE_AUTH_USER_NOTIFICATIONS,
      payload: [],
    });
  } catch (err: unknown) {
    dispatch({
      type: UPDATE_AUTH_USER_NOTIFICATIONS,
      payload: [],
    });
  }
};
