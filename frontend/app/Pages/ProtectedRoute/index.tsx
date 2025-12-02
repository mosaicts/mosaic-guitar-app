import { Navigate, Outlet, useNavigation } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '@/Providers/authProvider';
import Spinner from '@/Components/Spinner';
import { getJwt, storeJwt } from '@/lib/auth';
import { refreshTokenApi } from '@/utils/apis';

export async function clientLoader() {
  console.log('running client loader...');

  if (!getJwt()) {
    console.log('refreshing token...');
    try {
      const response = await refreshTokenApi();
      const jwt = response.data.jwt;
      storeJwt(jwt);
      console.log('token refreshed');
    } catch (err) {
      console.log(err);
      console.log('token refresh failed');
    }
  }
}

export default function ProtectedRoute() {
  const { jwt, setJwt, isLoggedIn } = useAuth();
  const storedJwt = getJwt();
  const navigation = useNavigation();

  useEffect(() => {
    if (storedJwt && storedJwt !== jwt) {
      setJwt(storedJwt);
    }
  }, [storedJwt]);

  if (navigation.state === 'loading' && !isLoggedIn) {
    return <Spinner />;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}
