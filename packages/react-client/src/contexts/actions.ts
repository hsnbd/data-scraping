import { AuthUser } from './types';

/**
 * Common actions
 */
export const UPDATE_AUTH_USER = 'UPDATE_AUTH_USER';
export const UPDATE_AUTH_USER_NOTIFICATIONS = 'UPDATE_AUTH_USER_NOTIFICATIONS';
export const USER_LOADING = 'USER_LOADING';

export interface IUpdateAuthUserActions {
  type: typeof UPDATE_AUTH_USER;
  payload: AuthUser | null;
}

export interface IUpdateAuthUserNotificationsActions {
  type: typeof UPDATE_AUTH_USER_NOTIFICATIONS;
  payload: never[];
}

export interface IUserLoadingActions {
  type: typeof USER_LOADING;
  payload: boolean;
}

export const userLoading = (status: boolean): ActionTypes => ({
  type: USER_LOADING,
  payload: status,
});

export type ActionTypes = IUpdateAuthUserActions | IUpdateAuthUserNotificationsActions | IUserLoadingActions;
