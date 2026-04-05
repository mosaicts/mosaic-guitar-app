import type { Route } from './+types';
import { redirect, useSearchParams, useSubmit } from 'react-router';
import useErrorMessage from '@/Hooks/useErrorMessage';
import { useState, useEffect } from 'react';
import OTPInput from '@/Components/OTPInput';
import { postForgot, resetVerify } from '@/utils/apis';
import './index.css';

const TOTP_SECS = 30;

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();
  let response;
  try {
    switch (formData.get('type')) {
      case 'resend':
        response = await postForgot(formData);
        return {
          success: true,
          remaining: response.data.remaining
        };
      case 'submit':
        response = await resetVerify(formData);
        return redirect(`/forgot/reset?id=${response.data.id}`);
    }
  } catch (err: any) {
    return {
      success: false,
      response: err.response
    };
  }
}

export default function ForgotVerify() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const [remainingSecs, setRemainingSecs] = useState(TOTP_SECS);
  const email = searchParams.get('email');
  const isResetEnabled = remainingSecs < 0;
  const { errorMsg } = useErrorMessage();

  useEffect(() => {
    if (!isResetEnabled) {
      const intervalID = setInterval(() => setRemainingSecs((prev) => prev - 1), 1000);
      return () => clearInterval(intervalID);
    }
  }, [isResetEnabled]);

  const handleResend = () => {
    submit(
      { type: 'resend', email },
      {
        action: `/forgot/verify?email=${email}`,
        method: 'post'
      }
    );
    setRemainingSecs(TOTP_SECS);
  };

  const handleComplete = (pin: string) => {
    submit(
      { type: 'submit', otp: pin, email },
      {
        action: `/forgot/verify?email=${email}`,
        method: 'post'
      }
    );
  };

  const handleCancel = () => {
    submit(
      { type: 'cancel' },
      {
        action: '/',
        method: 'get'
      }
    );
  };

  return (
    <div className="background">
      <div className="reset verify container">
        <div id="header">
          <h2>OTP Verification</h2>
          <p>
            One Time Password (OTP) has been sent via email to{' '}
            <span>{searchParams.get('email')}</span>
          </p>
          <p>Enter the OTP below to verify it.</p>
        </div>

        <div className="otp container">
          <OTPInput length={6} onComplete={handleComplete} aria-describedby="otp-help" />
          {errorMsg && (
            <span id="otp-help" className="error">
              {errorMsg}
            </span>
          )}
          <button
            className={'resend btn' + (isResetEnabled ? ' enabled' : '')}
            onClick={handleResend}
            disabled={!isResetEnabled}
          >
            {isResetEnabled ? (
              'Resend OTP'
            ) : (
              <>
                Resend OTP in{' '}
                <time>{new Date(remainingSecs * 1000).toISOString().slice(14, 19)}</time>
              </>
            )}
          </button>
        </div>
        <button className="cancel btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
