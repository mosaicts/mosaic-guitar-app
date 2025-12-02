import type { Route } from './+types';
import { redirect, useSearchParams, useSubmit, useActionData } from 'react-router';
import { useState, useEffect } from 'react';
import OTPInput from '@/Components/OTPInput';
import { postForgot, resetVerify } from '@/utils/apis';
import './index.css';

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();
  try {
    switch (formData.get('type')) {
      case 'resend':
        await postForgot(formData);
      case 'submit':
        await resetVerify(formData);
        return redirect(`/forgot/reset?id=${formData.get('email')}`);
    }
  } catch (err: any) {
    return {
      success: false,
      response: err.response.data
    };
  }
}

export default function ResetVerify() {
  const submit = useSubmit();
  const [remainingSecs, setRemainingSecs] = useState(30);
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const data = useActionData();
  const id = searchParams.get('id');
  const isResetEnabled = remainingSecs < 0;

  useEffect(() => {
    if (!isResetEnabled) {
      const intervalID = setInterval(() => setRemainingSecs((prev) => prev - 1), 1000);
      return () => clearInterval(intervalID);
    }
  }, [isResetEnabled]);

  useEffect(() => {
    const setErrorsPostSubmit = () => {
      if (data && !data.success && data.response) {
        if (data.response.message) {
          setError(data.response.message);
        } else {
          console.log(data.response.message);
        }
      }
    };
    setErrorsPostSubmit();
  }, [data]);

  const handleResend = () => {
    submit(
      { type: 'resend', id },
      {
        action: `/reset/verify?id=${id}`,
        method: 'post'
      }
    );
    setRemainingSecs(30);
  };

  const handleComplete = (pin: string) => {
    submit(
      { type: 'submit', pin, id },
      {
        action: `/reset/verify?id=${id}`,
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
    <div className="modal-bg">
      <div id="reset-verify" className="modal">
        <div id="header">
          <h2>OTP Verification</h2>
          <p>
            One Time Password (OTP) has been sent via email to{' '}
            <span>{searchParams.get('email')}</span>
          </p>
          <p>Enter the OTP below to verify it.</p>
        </div>

        <div className="otp-container">
          <OTPInput length={6} onComplete={handleComplete} />
          <span className="err">{error}</span>
          <button
            className={'resend-btn' + (isResetEnabled ? ' enabled' : '')}
            onClick={handleResend}
            disabled={!isResetEnabled}
          >
            {isResetEnabled ? (
              'Resend OTP'
            ) : (
              <>
                Resend OTP in{' '}
                <span className="timer">
                  {new Date(remainingSecs * 1000).toISOString().slice(14, 19)}
                </span>
              </>
            )}
          </button>
        </div>

        <div id="submit-btns">
          {
            // <button className="submit-btn">Verify</button>
          }
          <button id="cancel-btn" className="submit-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
