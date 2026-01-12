import type { Route } from './+types';
import { useEffect } from 'react';
import { Form, Link, useNavigate, useSubmit, useActionData, useNavigation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { type IconProp } from '@fortawesome/fontawesome-svg-core';

import { loginApi } from '@/utils/apis';
import { facebookSigninURL, googleSigninURL } from '@/Constants/apis';
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
  const { type, ...data } = Object.fromEntries(formData);
  let response;
  try {
    response = await loginApi(data);
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

  const { onLogin } = useAuth();
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const data = useActionData();
  const errorMsg =
    data && !data.success && data.response !== undefined && data.response.data.message;

  useEffect(() => {
    if (data && data.success && data.response !== undefined) {
      onLogin(data.response.data.jwt);
      navigate('/');
    }
  }, [data]);

  const onSubmit = async (data: object) => {
    submit({ ...data, type: 'default' }, { method: 'post' });
  };

  const isSubmitting = navigation.state === 'submitting';
  // TODO: add pending UI for this state
  const isDisabled = isSubmitting; // Prevents double-submit

  return (
    <div className="login">
      <div className="container">
        <h1>Sign in</h1>
        <Form method="post" onSubmit={handleSubmit(onSubmit)}>
          {!errors.email && !errors.password && errorMsg && <p className="error">{errorMsg}</p>}
          <div className="email">
            <label htmlFor="email-input">Email</label>
            <input id="email-input" required {...register('email')} />
            {errors.email && <span className="err">{errors.email.message}</span>}
          </div>
          <div className="password">
            <div>
              <label htmlFor="password-input">Password</label>
              <Link to="/forgot">Forgot password?</Link>
            </div>
            <PasswordInput required {...register('password')} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            disabled={isDisabled}
            className={'submit btn' + (isSubmitting ? ' progress' : '')}
          >
            {isSubmitting ? 'Sign in...' : 'Sign in'}
          </button>
          <Separation />
          <a className="fb btn" href={facebookSigninURL}>
            <span className="login-text">
              <FontAwesomeIcon icon={faFacebook as IconProp} /> Continue with Facebook
            </span>
          </a>
          <a className="google btn" href={googleSigninURL}>
            <span className="login-text">
              <FontAwesomeIcon icon={faGoogle as IconProp} /> Continue with Google
            </span>
          </a>
        </Form>
        <div id="create-account">
          <p>
            New?{' '}
            <Link id="to_signup" to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
