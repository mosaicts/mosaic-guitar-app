import type { Route } from './+types';
import { useEffect } from 'react';
import { Form, Link, useSubmit, useActionData, useNavigation, redirect } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { signup } from '@/utils/apis';
import PasswordInput from '@/Components/PasswordInput';
import Separation from '@/Components/Separation';
import { passwordValidationPatterns } from '@/lib/password';
import './index.css';

const SignupUserSchema = z
  .object({
    firstName: z.string().min(1, { message: 'Please enter first name' }),
    lastName: z.string().min(1, { message: 'Please enter first name' }),
    username: z.string().min(1, { message: 'Please enter username' }),
    email: z.email({ message: 'Please enter a valid email address' }),
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

type SignupUserSchemaType = z.infer<typeof SignupUserSchema>;

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await signup(data);
    return redirect('/signup/check-email');
  } catch (err: any) {
    return {
      success: false,
      response: err.response
    };
  }
}

export default function Signup() {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignupUserSchemaType>({
    resolver: zodResolver(SignupUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const errorMsg =
    actionData &&
    !actionData.success &&
    actionData.response !== undefined &&
    !actionData.response.data.errors &&
    actionData.response.data.message;

  useEffect(() => {
    const setErrorsPostSubmit = () => {
      if (actionData && !actionData.success && actionData.response.data) {
        if (actionData.response.data.errors) {
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
    submit({ ...data }, { method: 'post' });
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
    <div className="signup">
      <div className="left"></div>
      <div className="right">
        <div className="container">
          <h1>Create an account</h1>
          <Form method="post" onSubmit={handleSubmit(onSubmit)}>
            {!errors.email && !errors.password && errorMsg && (
              <span className="error">{errorMsg}</span>
            )}
            <div className="names">
              <div id="first name">
                <label htmlFor="first-name-input">
                  First name{' '}
                  <span className="required-asterisk" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="first-name-input"
                  required
                  aria-describedby="first-name-help"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <span id="first-name-help" className="error">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div id="last name">
                <label htmlFor="last-name-input">
                  Last name{' '}
                  <span className="required-asterisk" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="last-name-input"
                  required
                  aria-describedby="last-name-help"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <span id="last-name-help" className="error">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>
            <div className="username">
              <label htmlFor="username-input">
                Username{' '}
                <span className="required-asterisk" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="username-input"
                required
                aria-describedby="username-help"
                {...register('username')}
              />
              {errors.username && (
                <span id="username-help" className="error">
                  {errors.username.message}
                </span>
              )}
            </div>
            <div className="email">
              <label htmlFor="email-input">
                Email{' '}
                <span className="required-asterisk" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="email-input"
                required
                type="email"
                aria-describedby="email-help"
                {...register('email')}
              />
              {errors.email && (
                <span id="email-help" className="error">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="password">
              <label htmlFor="password-input">
                Password{' '}
                <span className="required-asterisk" aria-hidden="true">
                  *
                </span>
              </label>
              <PasswordInput
                {...register('password', {
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
                <span id="password-help" className="error">
                  {errors.password.message}
                </span>
              ) : (
                password.length > 0 && (
                  <span id="password-help" className={`strength ${passwordStrength}`}>
                    Strength: {passwordStrength}
                  </span>
                )
              )}
            </div>
            <div className="confirm-password">
              <label htmlFor="confirm-password-input">
                Confirm password{' '}
                <span className="required-asterisk" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="confirm-password-input"
                type="password"
                required
                aria-describedby="confirm-password-help"
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
                <span id="confirm-password-help" className="error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            <button
              id="signup"
              type="submit"
              disabled={isDisabled}
              className={'submit btn' + (isSubmitting ? ' progress' : '')}
            >
              {isSubmitting ? 'Create account...' : 'Create account'}
            </button>
            <Separation />
            <div className="have-account">
              <span>
                Already have an account?{' '}
                <Link id="to_login" to="/login">
                  &rarr; Login
                </Link>
              </span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
