import type { Route } from './+types/index';
import { useEffect } from 'react';
import { Form, Link, useSubmit, useActionData, useNavigation, redirect } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { register as requestRegisterApi } from '@/utils/apis';
import PasswordInput from '@/Components/PasswordInput';
import Separation from '@/Components/Separation';
import './index.css';

const RegisterUserSchema = z
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

type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>;

// Password validation patterns
const passwordValidationPatterns = {
  atLeastOneUppercase: /[A-Z]/,
  atLeastOneLowercase: /[a-z]/,
  atLeastOneNumeric: /[0-9]/,
  atLeastOneSpecialChar: /[!@#\$%\^\&*\)\(+=._-]/
};

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const response = await requestRegisterApi(data);
    console.log(response);
    return redirect('/check-your-email');
  } catch (err: any) {
    return {
      success: false,
      response: err.response.data
    };
  }
}

export default function Register() {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterUserSchemaType>({
    resolver: zodResolver(RegisterUserSchema),
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
    if (data && !data.success && data.response) {
      if (data.response.errors) {
        Object.entries(data.response.errors).forEach((err: any) => {
          setError(err[0], { type: 'manual', message: err[1][0] });
        });
      } else {
        console.log(data.response.message);
      }
    }
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
    <div id="register-page">
      <div id="left"></div>
      <div id="right">
        <div id="modal">
          <h1>Create an account</h1>
          <Form id="register-form" method="post" onSubmit={handleSubmit(onSubmit)}>
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
              id="register"
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
