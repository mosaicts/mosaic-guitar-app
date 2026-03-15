import { axiosInstance as axios } from '@/lib/axiosInterceptor';
import { useNavigate } from 'react-router';
import { createContext, useContext, useEffect } from 'react';
import { Role, type User } from '@/utils/models';
import usePersistor, { useDriver } from '@/Hooks/usePersistor';
import useGlobalSignout from '@/Hooks/useGlobalSignout';
import useIsSsr from '@/Hooks/useIsSsr';
import { getProfile } from '@/utils/apis';
import { parseUserDataFromJwt, getFingerprintHash } from '@/lib/auth';

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  jwt: string;
  setJwt: (data: string) => void;
  isLoggedIn: boolean;
  onLogin: (token: string) => void;
  onSignout: () => void;
}

const initialContextValues = {
  user: {
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    avatar: '',
    role: Role.USER
  },
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
  const [user, setUser] = usePersistor<User>('user', initialContextValues.user, userDriver, isSsr);
  console.log({ user });
  const isLoggedIn = jwt !== initialContextValues.jwt;
  const navigate = useNavigate();

  const onSignout = useGlobalSignout(() => {
    setJwt(initialContextValues.jwt);
    setUser(initialContextValues.user);
    driver.remove('jwt');
    navigate('/login');
  });

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
      // const userData = parseUserDataFromJwt(jwt, initialContextValues.user);
      // console.log({ userData });
      // setUser(userData);

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
    <AuthContext value={{ user, setUser, jwt, setJwt, isLoggedIn, onLogin, onSignout }}>
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
