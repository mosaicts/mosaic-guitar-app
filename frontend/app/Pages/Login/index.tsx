import type { Route } from './+types/index';
import { useEffect } from 'react';
import { Form, Link, useNavigate, useSubmit, useActionData, useNavigation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { login } from '@/utils/apis';
import { useAuth } from '@/Providers/authProvider';
import PasswordInput from '@/Components/PasswordInput';
import Separation from '@/Components/Separation';
import './index.css';

const LoginUserSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Please enter a password' })
});

export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const response = await login(data);
    return {
      success: true,
      response
    };
  } catch (err: any) {
    return {
      success: false,
      response: err.response
    };
  }
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginUserSchemaType>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { setUser, setJwt, setRefreshToken } = useAuth();
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const data = useActionData();
  const errorMsg = data && !data.success && data?.response.data.message;

  useEffect(() => {
    if (data && data.success && data.response) {
      const response = data.response;
      setUser(response.data.user);
      setJwt(response.data.jwt);
      setRefreshToken(response.data.refreshToken);
      navigate('/');
    }
  }, [data]);

  const onSubmit = (data) => {
    submit(data, { method: 'post' });
  };

  const isSubmitting = navigation.state === 'submitting';
  // TODO: add pending UI for this state
  const isDisabled = isSubmitting; // Prevents double-submit

  return (
    <div id="login-page">
      <div className="modal">
        <h1>Sign in</h1>
        <Form id="login-form" method="post" onSubmit={handleSubmit(onSubmit)}>
          {!errors.email && !errors.password && errorMsg && <p className="err">{errorMsg}</p>}
          <div id="email">
            <label htmlFor="email-input">Email</label>
            <input id="email-input" required {...register('email')} />
            {errors.email && <span className="err">{errors.email.message}</span>}
          </div>
          <div id="password">
            <div>
              <label htmlFor="password-input">Password</label>
              <Link to="/password-reset">Forgot password?</Link>
            </div>
            <PasswordInput required {...register('password')} />
            {errors.password && <span className="err">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            disabled={isDisabled}
            className={'submit-btn' + (isSubmitting ? ' progress' : '')}
          >
            {isSubmitting ? 'Sign in...' : 'Sign in'}
          </button>
          <Separation />
          <button id="with-google" type="submit" className="submit-btn">
            Continue with Google
          </button>
        </Form>
        <div id="create-account">
          <p>
            New?{' '}
            <Link id="to_register" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
