import type { Route } from './+types';
import { axiosInstance as axios } from '@/lib/axiosInterceptor';
import { useFetcher, redirect, useLoaderData, useActionData } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/Providers/authProvider';
import { updateUser, getProfile } from '@/utils/apis';
import { getJwt, getFingerprintHash, parseUser } from '@/lib/auth';
import './index.css';

export async function clientLoader() {
  console.log('Run loader...');
  const jwt = getJwt();
  const fingerprintHash = getFingerprintHash(jwt);
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwt;
  try {
    const response = await getProfile({ fingerprintHash });
    console.log({ data: response.data });
    return parseUser(response.data.user);
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
  let { user, setUser } = useAuth();
  const [isEdit, setEdit] = useState<boolean>(false);
  const data = useLoaderData();

  /**
  After form submit, re-render: fetcher.formData change (containing form data submitted)
  Then client revalidate by loading new data, re-render: formData become undefined
   */
  useEffect(() => {
    let newUser;
    if (fetcher.formData) {
      newUser = { ...user, ...Object.fromEntries(fetcher.formData) };
    } else {
      newUser = data;
    }
    setUser(newUser);
    setEdit(false);
  }, [fetcher.formData]);

  return (
    <div className="profile">
      {isEdit ? (
        <>
          <fetcher.Form method="post">
            <div className="username">
              <label>Username:</label>
              <input name="username" defaultValue={user?.username} />
            </div>
            <div className="first name">
              <label>First name:</label>
              <input name="firstName" defaultValue={user?.firstName} />
            </div>
            <div className="last name">
              <label>Last name:</label>
              <input name="lastName" defaultValue={user?.lastName} />
            </div>

            <div className="btns">
              <button className="update btn" type="submit">
                Submit
              </button>
              <button className="cancel btn" onClick={() => setEdit(!isEdit)}>
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
          <button className="edit btn" onClick={() => setEdit(!isEdit)}>
            Edit
          </button>
        </>
      )}
    </div>
  );
}
