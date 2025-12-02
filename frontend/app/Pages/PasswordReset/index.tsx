import type { Route } from './+types';
import { Form, redirect, useActionData, useNavigation, useSubmit } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postForgot } from '@/utils/apis';
import './index.css';

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const response = await postForgot(data);
    return redirect(`/forgot/reset/verify?email=${formData.get('email')}&id=${response.data.id}`);
  } catch (err: any) {
    return {
      success: false,
      response: err.response.data
    };
  }
}

export default function Forgot({ request }: Route.ClientActionArgs) {
  return (
    <div className="modal-bg">
      <div id="forgot" className="modal">
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
  const data = useActionData();
  const navigation = useNavigation();
  const errorMsg = data && !data.success && data?.response.data.message;
  const isSubmitting = navigation.state === 'submitting';
  const isDisabled = isSubmitting; // Prevents double-submit

  const onSubmit = (data) => {
    submit(data, { method: 'post' });
  };

  return (
    <Form id="forgot-form" method="post" onSubmit={handleSubmit(onSubmit)}>
      {!errors.email && errorMsg && <p className="err">{errorMsg}</p>}
      <div id="email">
        <label htmlFor="email-input">Email</label>
        <input id="email-input" required {...register('email')} />
        {errors.email && <span className="err">{errors.email.message}</span>}
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        className={'submit-btn' + (isSubmitting ? ' progress' : '')}
      >
        {isSubmitting ? 'Send Verification Code...' : 'Send Verification Code'}
      </button>
    </Form>
  );
};
