import React from 'react';
import { RouteObject } from 'react-router-dom';

import HomeScreen from 'screens/Home';
import LoginScreen from 'screens/Login';

import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import KeywordScreen from '../screens/Keyword';
import SignupScreen from '../screens/Signup';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeScreen />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginScreen />
      </GuestRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <GuestRoute>
        <SignupScreen />
      </GuestRoute>
    ),
  },
  {
    path: '/keywords',
    element: (
      <ProtectedRoute>
        <KeywordScreen />
      </ProtectedRoute>
    ),
  },
];

export default routes;
