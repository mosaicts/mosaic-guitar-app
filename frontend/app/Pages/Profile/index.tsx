import type { Route } from './+types';
import { Form, useActionData, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../Providers/authProvider';
import { updateUser } from '../../utils/apis';
import { getJwt, getFingerprintHash } from '../../lib/auth';
import './index.css';

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let data = Object.fromEntries(formData);
  const fingerprintHash = getFingerprintHash(getJwt());
  data = { fingerprintHash, ...data };

  try {
    const response = await updateUser(data);
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

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const data = useActionData();

  useEffect(() => {
    if (data && data.success && data.response) {
      const response = data.response;
      setUser(response.data.user);
      setIsEdit(false);
    }
  }, [data]);

  return (
    <div id="profile">
      {isEdit ? (
        <>
          <Form method="post">
            <div id="username">
              <label>Username:</label>
              <input name="username" defaultValue={user?.username} />
            </div>
            <div id="first-name">
              <label>First name:</label>
              <input name="firstName" defaultValue={user?.firstName} />
            </div>
            <div id="last-name">
              <label>Last name:</label>
              <input name="lastName" defaultValue={user?.lastName} />
            </div>
            <div id="edit-form-btns">
              <button id="update" type="submit">
                Submit
              </button>
              <button id="cancel" onClick={() => setIsEdit(!isEdit)}>
                Cancel
              </button>
            </div>
          </Form>
        </>
      ) : (
        <>
          <label>Username: {user?.username}</label>
          <label>First name: {user?.firstName}</label>
          <label>Last name: {user?.lastName}</label>
          <label>Email: {user?.email}</label>
          <button id="Edit" onClick={() => setIsEdit(!isEdit)}>
            Edit
          </button>
        </>
      )}
    </div>
  );
}
