import { useActionData } from 'react-router';
import { useEffect } from 'react';
import { type UseFormSetError, type FieldValues } from 'react-hook-form';

const useErrorMessage = () => {
  const actionData = useActionData();
  const errorMsg = actionData && !actionData.success && actionData?.response.data.message;
  return { errorMsg, actionData };
};

export const useErrorMessageForFields = <T>(
  setError: UseFormSetError<T extends FieldValues ? T : never>
) => {
  const { errorMsg, actionData } = useErrorMessage();

  useEffect(() => {
    const setErrorsPostSubmit = () => {
      if (actionData && !actionData.success && actionData.response.data) {
        if (actionData.response.data.errors) {
          Object.entries(actionData.response.data.errors).forEach((err: any) => {
            setError(err[0], { type: 'manual', message: err[1][0] });
          });
        }
      }
    };
    setErrorsPostSubmit();
  }, [actionData]);

  return { errorMsg, actionData };
};

export default useErrorMessage;
