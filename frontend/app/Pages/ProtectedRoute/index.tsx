import type { Route } from './+types';
import { Outlet, useNavigation, useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/Providers/authProvider';
import Spinner from '@/Components/Spinner';
import { storeJwt, getJwt } from '@/lib/auth';
import { refreshTokenApi } from '@/utils/apis';

export async function clientLoader() {
  console.log('running client loader...');

  const oldJwt = getJwt();
  let newJwt;

  if (!oldJwt) {
    console.log('refreshing token...');
    try {
      const response = await refreshTokenApi();
      newJwt = response.data.jwt;
      console.log({ newJwt });
      storeJwt(newJwt);
      console.log('token refreshed');
    } catch (err) {
      console.log(err);
      console.log('token refresh failed');
    }
  }
  return { newJwt, oldJwt };
}

export default function ProtectedRoute({ loaderData }: Route.ComponentProps) {
  const { jwt, isLoggedIn } = useAuth();
  const { newJwt, oldJwt } = loaderData;
  const navigation = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    if (newJwt && newJwt !== jwt) {
      console.log('store new jwt');
      storeJwt(newJwt);
    }
  }, [newJwt]);

  useEffect(() => {
    /**
    Old jwt is loaded when refreshing page
    New jwt is loaded when opening a new tab
    or closing then opening the page
    When there is an old jwt and new jwt then not navigating to /login
     */
    if (newJwt || oldJwt) {
      return;
    }
    if (!isLoggedIn) {
      // user is not authenticated
      console.log('Navigating to /login...');
      navigate('/login');
      return;
    }
  }, [newJwt, oldJwt, isLoggedIn]);

  if (navigation.state === 'loading' && !isLoggedIn) {
    return <Spinner />;
  }

  console.log('Navigating to /Home...');

  // return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
  return <Outlet />;
}
