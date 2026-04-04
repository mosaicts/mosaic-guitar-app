import type { Route } from './+types';
import { useEffect } from 'react';
import {
  Form,
  useSearchParams,
  useSubmit,
  useActionData,
  useNavigation,
  redirect
} from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import PasswordInput from '@/Components/PasswordInput';
import { passwordValidationPatterns } from '@/lib/password';
import { resetPassword } from '@/utils/apis';
import './index.css';

const ResetSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: 'Please enter a password' })
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' })
      .min(8, { message: 'Password must be at least 8 characters' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type ResetSchemaType = z.infer<typeof ResetSchema>;

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await resetPassword(data);
    return redirect('/');
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      response: err.response
    };
  }
}

export default function ForgotReset() {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ResetSchemaType>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const errorMsg =
    actionData &&
    !actionData.success &&
    actionData.response !== undefined &&
    !actionData.response.data.errors &&
    actionData.response.data.message;

  useEffect(() => {
    const setErrorsPostSubmit = () => {
      if (actionData && !actionData.success && actionData.response.data) {
        if (actionData.response.errors) {
          Object.entries(actionData.response.data.errors).forEach((err: any) => {
            setError(err[0], { type: 'manual', message: err[1][0] });
          });
        } else {
          console.log(actionData.response.data.message);
        }
      }
    };
    setErrorsPostSubmit();
  }, [actionData]);

  const onSubmit = async (data: object) => {
    submit({ ...data, id: searchParams.get('id') }, { method: 'post' });
  };

  const onCancel = async () => {
    submit(
      { type: 'cancel' },
      {
        action: '/',
        method: 'get'
      }
    );
  };

  const password: string = useWatch({
    control,
    name: 'password'
  });

  const countPasswordCritMatch = Object.entries(passwordValidationPatterns).filter(([_, value]) =>
    value.test(password)
  ).length;

  const passwordStrength =
    countPasswordCritMatch <= 1 ? 'low' : countPasswordCritMatch === 2 ? 'medium' : 'strong';

  const isSubmitting = navigation.state !== 'idle';
  const isDisabled = isSubmitting; // Prevents double-submit

  return (
    <div className="background">
      <div className="reset container">
        <h1>Reset your password</h1>
        <Form method="post" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && <span className="error">{errorMsg}</span>}
          <div className="password">
            <label htmlFor="password-input">
              New password <span className="required-asterisk">*</span>
            </label>
            <PasswordInput
              {...register('password', {
                required: true,
                onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.reportValidity();
                },
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  // if password length < 8 set and error
                  const value = e.target.value;
                  if (value.length < 8) {
                    e.target.setCustomValidity('Password must be at least 8 characters');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }
              })}
            />
            {errors.password ? (
              <span className="err">{errors.password.message}</span>
            ) : (
              password.length > 0 && (
                <span className={`strength ${passwordStrength}`}>Strength: {passwordStrength}</span>
              )
            )}
          </div>
          <div className="confirm password">
            <label htmlFor="confirm-password-input">
              Confirm password <span className="required-asterisk">*</span>
            </label>
            <input
              id="confirm-password-input"
              type="password"
              placeholder="Re-enter your password"
              required
              {...register('confirmPassword', {
                onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.reportValidity();
                },
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  // if password length < 8 set and error
                  const value = e.target.value;
                  if (value != password) {
                    e.target.setCustomValidity('Password does not match');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }
              })}
            />
            {errors.confirmPassword && (
              <span className="err">{errors.confirmPassword.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isDisabled}
            className={'submit btn' + (isSubmitting ? ' progress' : '')}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button className="cancel btn" onClick={onCancel}>
            Cancel
          </button>
        </Form>
      </div>
    </div>
  );
}
