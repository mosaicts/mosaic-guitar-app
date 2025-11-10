import type { Route } from '../VerifyEmail/+types';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { verifyEmail } from '@/utils/apis';
import './index.css';
import { useLoaderData, useNavigation } from 'react-router';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const data = { email: url.searchParams.get('email'), token: url.searchParams.get('token') };
  try {
    const response = await verifyEmail(data);
    return {
      success: true,
      response: response.data.message
    };
  } catch (err: any) {
    return {
      success: true,
      response: err.response.data.message
    };
  }
}

export default function VerifyEmail() {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const data = useLoaderData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate('/login');
    }, 10000);
    ref.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
      ref.current = null;
    };
  }, [data]);

  return (
    <div className="modal-bg">
      {navigation.state === 'loading' ? (
        <p>Verify...</p>
      ) : (
        <div>
          <h2>{data.response}</h2>
          <p>
            Click{' '}
            <a
              href="/login"
              onClick={() => {
                navigate('/login');
                if (ref.current) {
                  clearTimeout(ref.current);
                }
              }}
            >
              here
            </a>{' '}
            to redirect to login page or redirect automatically within 10 seconds
          </p>
        </div>
      )}
    </div>
  );
}
