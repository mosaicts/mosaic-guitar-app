import type { Route } from './+types';
import { redirect, useNavigate, useNavigation, useSearchParams, useSubmit } from 'react-router';
import { useEffect, useRef } from 'react';
import { signupResend } from '@/utils/apis';
import './index.css';

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();
  await signupResend({ email: formData.get('email') });
  return redirect('/signup/check-email');
}

export default function SignupVerify() {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchParams] = useSearchParams();

  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const success = searchParams.get('status') === 'success';
  const verificationStatus = success ? 'Verification Success' : 'Verification Failed';
  const isSubmitting = navigation.state !== 'idle';
  const isDisabled = isSubmitting; // Prevents double-submit

  const handleBtnClick = () => {
    submit(
      { email: searchParams.get('email') },
      {
        action: '/signup/verify',
        method: 'post'
      }
    );
  };

  useEffect(() => {
    if (success) {
      const timeoutId = setTimeout(() => {
        navigate('/login');
      }, 1000 * 10);
      ref.current = timeoutId;

      return () => {
        clearTimeout(timeoutId);
        ref.current = null;
      };
    }
  });

  return (
    <div id="signup-verify" className="modal-bg">
      <div className="modal">
        <h2>{verificationStatus}</h2>
        {success ? (
          <p>
            Click{' '}
            <a
              href="/login"
              onClick={() => {
                if (ref.current) {
                  clearTimeout(ref.current);
                }
                return true;
              }}
            >
              here
            </a>{' '}
            to redirect to login page or redirect automatically within 10 seconds
          </p>
        ) : (
          <button
            className={'submit-btn' + (isSubmitting ? ' progress' : '')}
            disabled={isDisabled}
            onClick={handleBtnClick}
          >
            {isSubmitting ? 'Resend verification code...' : 'Resend verification code'}
          </button>
        )}
      </div>
    </div>
  );
}
