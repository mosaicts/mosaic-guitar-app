import type { Route } from './+types';
import { useFetcher, useActionData, useNavigate, redirect, useLoaderData } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../Providers/authProvider';
import { updateUser, getProfile } from '../../utils/apis';
import { getJwt, getFingerprintHash } from '../../lib/auth';
import './index.css';

export async function clientLoader() {
  const fingerprintHash = getFingerprintHash(getJwt());
  try {
    const response = await getProfile({ fingerprintHash });
    return { latestUserData: response.data.user };
  } catch (err) {
    console.log(err);
    return redirect('/login');
  }
}

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let data = Object.fromEntries(formData);
  const fingerprintHash = getFingerprintHash(getJwt());
  data = { fingerprintHash, ...data };

  try {
    await updateUser(data);
  } catch (err: any) {
    console.log(err);
    return redirect('/login');
  }
}

export default function Profile() {
  const fetcher = useFetcher();
  const { setUser } = useAuth();
  const [isEdit, setEdit] = useState<boolean>(false);
  const { latestUserData } = useLoaderData();
  const user = fetcher.formData
    ? { ...latestUserData, ...Object.fromEntries(fetcher.formData) }
    : latestUserData;
  const isUpdating = JSON.stringify(user) !== JSON.stringify(latestUserData);

  useEffect(() => {
    setUser(user);
    setEdit(false);
  }, [isUpdating]);

  return (
    <div id="profile">
      {isEdit ? (
        <>
          <fetcher.Form method="post">
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
              <button id="cancel" onClick={() => setEdit(!isEdit)}>
                Cancel
              </button>
            </div>
          </fetcher.Form>
        </>
      ) : (
        <>
          <label>Username: {user?.username}</label>
          <label>First name: {user?.firstName}</label>
          <label>Last name: {user?.lastName}</label>
          <label>Email: {user?.email}</label>
          <button id="Edit" onClick={() => setEdit(!isEdit)}>
            Edit
          </button>
        </>
      )}
    </div>
  );
}
