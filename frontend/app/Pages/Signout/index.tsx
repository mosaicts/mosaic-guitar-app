import { Navigate, useNavigation, useLoaderData } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '@/Providers/authProvider';
import { signoutApi } from '@/utils/apis';
import Spinner from '@/Components/Spinner';

export async function clientLoader() {
  console.log('running client loader...');
  try {
    console.log('calling signout/...');
    await signoutApi();
    console.log('signout/ called');
    return {
      success: true
    };
  } catch (err: any) {
    return {
      success: false
    };
  }
}

export default function Signout() {
  const navigation = useNavigation();
  const data = useLoaderData();
  const { onSignout } = useAuth();

  useEffect(() => {
    if (data && data.success) {
      console.log('post-signout');
      onSignout();
    }
  }, [data]);

  if (navigation.state !== 'idle') {
    return <Spinner />;
  }

  return <Navigate to="/login" />;
}
