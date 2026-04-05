import type { Route } from './+types';
import { Form, redirect, useActionData, useNavigation, useSubmit } from 'react-router';
import { useForm } from 'react-hook-form';
import useErrorMessage from '@/Hooks/useErrorMessage';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postForgot } from '@/utils/apis';
import './index.css';

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await postForgot(data);
    return redirect(`/forgot/verify?email=${formData.get('email')}`);
  } catch (err: any) {
    return {
      success: false,
      response: err.response.data
    };
  }
}

export default function Forgot() {
  return (
    <div className="forgot background">
      <div className="container">
        <h3>
          Enter your user account's verified email address and we will send you a verification code
        </h3>
        <InputEmail />
      </div>
    </div>
  );
}

const InputEmailSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' })
});

export type InputEmailSchemaType = z.infer<typeof InputEmailSchema>;

const InputEmail = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InputEmailSchemaType>({
    resolver: zodResolver(InputEmailSchema),
    defaultValues: {
      email: ''
    }
  });
  const submit = useSubmit();
  const navigation = useNavigation();
  const { errorMsg } = useErrorMessage();
  const isSubmitting = navigation.state === 'submitting';
  const isDisabled = isSubmitting; // Prevents double-submit

  const onSubmit = (data: object) => {
    submit({ ...data }, { method: 'post' });
  };

  return (
    <Form method="post" onSubmit={handleSubmit(onSubmit)}>
      {!errors.email && errorMsg && <span className="error">{errorMsg}</span>}
      <div className="email">
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          required
          placeholder="Enter your email"
          {...register('email')}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        className={'submit btn' + (isSubmitting ? ' progress' : '')}
      >
        {isSubmitting ? 'Send Verification Code...' : 'Send Verification Code'}
      </button>
    </Form>
  );
};
