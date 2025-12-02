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
      response: err.response.data
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
  const data = useActionData();

  useEffect(() => {
    const setErrorsPostSubmit = () => {
      if (data && !data.success && data.response) {
        if (data.response.errors) {
          Object.entries(data.response.errors).forEach((err: any) => {
            setError(err[0], { type: 'manual', message: err[1][0] });
          });
        } else {
          console.log(data.response.message);
        }
      }
    };
    setErrorsPostSubmit();
  }, [data]);

  const onSubmit = async (data) => {
    submit(data, { method: 'post' });
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
    <div id="signup-page">
      <div id="left"></div>
      <div id="right">
        <div className="modal">
          <h1>Create an account</h1>
          <Form id="signup-form" method="post" onSubmit={handleSubmit(onSubmit)}>
            <div className="name">
              <div id="first-name">
                <label htmlFor="first-name-input">
                  First name <span className="required-asterisk">*</span>
                </label>
                <input id="first-name-input" required {...register('firstName')} />
                {errors.firstName && <span className="err">{errors.firstName.message}</span>}
              </div>
              <div id="last-name">
                <label htmlFor="last-name-input">
                  Last name <span className="required-asterisk">*</span>
                </label>
                <input id="last-name-input" required {...register('lastName')} />
                {errors.lastName && <span className="err">{errors.lastName.message}</span>}
              </div>
            </div>
            <div id="username">
              <label htmlFor="username-input">
                Username <span className="required-asterisk">*</span>
              </label>
              <input id="username-input" required {...register('username')} />
              {errors.username && <span className="err">{errors.username.message}</span>}
            </div>
            <div id="email">
              <label htmlFor="email-input">
                Email <span className="required-asterisk">*</span>
              </label>
              <input id="email-input" required {...register('email')} />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>
            <div id="password">
              <label htmlFor="password-input">
                Password <span className="required-asterisk">*</span>
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
                <span className="err">{errors.password.message}</span>
              ) : (
                password.length > 0 && (
                  <span className="password-strength" id={passwordStrength}>
                    Strength: {passwordStrength}
                  </span>
                )
              )}
            </div>
            <div id="confirm-password">
              <label htmlFor="confirm-password-input">
                Confirm password <span className="required-asterisk">*</span>
              </label>
              <input
                id="confirm-password-input"
                type="password"
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
              id="signup"
              type="submit"
              disabled={isDisabled}
              className={'submit-btn' + (isSubmitting ? ' progress' : '')}
            >
              {isSubmitting ? 'Create account...' : 'Create account'}
            </button>
            <Separation />
            <div id="already-have-account">
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
