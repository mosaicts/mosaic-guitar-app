import { axiosInstance as axios } from '@/lib/axiosInterceptor';
import { useNavigate } from 'react-router';
import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { Role, type User } from '@/utils/models';
import usePersistor, { useDriver } from '@/Hooks/usePersistor';
import useGlobalSignout from '@/Hooks/useGlobalSignout';
import useIsSsr from '@/Hooks/useIsSsr';
import { getProfile } from '@/utils/apis';
import { getFingerprintHash } from '@/lib/auth';

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  jwt: string;
  setJwt: (data: string) => void;
  isLoggedIn: boolean;
  onLogin: (token: string) => void;
  onSignout: () => void;
}

const initialUserValues = {
  id: '',
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  avatar: '',
  role: Role.USER
};

const initialContextValues = {
  user: initialUserValues,
  setUser: (data: User) => null,
  jwt: '',
  setJwt: () => null,
  isLoggedIn: false,
  onLogin: (token: string) => null,
  onSignout: () => null
};

const AuthContext = createContext<AuthContextType>(initialContextValues);

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const isSsr = useIsSsr();
  const driver = useDriver<string>(isSsr);
  const userDriver = useDriver<User>(isSsr);
  const [jwt, setJwt] = usePersistor<string>('jwt', initialContextValues.jwt, driver, isSsr);
  const [user, setUser] = usePersistor<User>('user', initialUserValues, userDriver, isSsr);
  const isLoggedIn = jwt !== initialContextValues.jwt;
  const navigate = useNavigate();

  const onSingleSignout = useCallback(() => {
    setJwt(initialContextValues.jwt);
    setUser(initialUserValues);
    driver.remove('jwt');
    navigate('/login');
  }, [setJwt, setUser, driver]);

  const onSignout = useGlobalSignout(onSingleSignout);

  const onLogin = (token: string) => {
    setJwt(token);
  };

  useEffect(() => {
    if (jwt) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwt;
      console.log('jwt set in header');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('jwt unset in header');
    }
  }, [jwt]);

  useEffect(() => {
    if (jwt) {
      console.log('set user to global state...');

      const fingerprintHash = getFingerprintHash(jwt);
      getProfile({ fingerprintHash })
        .then((response) => {
          const userData = response.data.user;
          if (user) {
            setUser(userData);
            console.log('profile loaded');
          }
        })
        .catch((err) => {
          console.log(err);
          console.log('profile load failed');
        });
    }
  }, [jwt]);

  // Provide the authentication context to the children components
  return (
    // <AuthContext value={contextValues}>
    <AuthContext value={{ user, setUser, jwt, setJwt, isLoggedIn, onLogin, onSignout }}>
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
