import { axiosInstance as axios } from '@/lib/axiosInterceptor';
import { createContext, useContext, useEffect, useRef } from 'react';
import { signoutApi } from '@/utils/apis';
import { Role, type User } from '@/utils/models';
import usePersistor, { useDriver, LocalStorageManager } from '@/Hooks/usePersistor';
import useGlobalSignout from '@/Hooks/useGlobalSignout';
import { getFingerprintHash } from '@/lib/auth';
import { getProfile } from '@/utils/apis';

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  jwt: string;
  setJwt: (data: string) => void;
  isLoggedIn: boolean;
  onLogin: (jwt: string) => void;
  onSignout: () => void;
}

const initialContextValues = {
  user: {
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    profilePicUrl: '',
    role: Role.USER
  },
  setUser: (data: User) => null,
  jwt: '',
  setJwt: () => null,
  isLoggedIn: false,
  onLogin: (jwt: string) => null,
  onSignout: () => null
};

const AuthContext = createContext<AuthContextType>(initialContextValues);

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [driver, userDriver] = useDriver() as [
    LocalStorageManager<string>,
    LocalStorageManager<User>
  ];
  const [user, setUser] = usePersistor<User>('user', initialContextValues.user, userDriver);
  const [jwt, setJwt] = usePersistor<string>('jwt', initialContextValues.jwt, driver);
  const isLoggedIn = jwt !== initialContextValues.jwt;

  const onSignout = useGlobalSignout(() => {
    setJwt(initialContextValues.jwt);
    setUser(initialContextValues.user);
    driver.remove('jwt');
  });

  const onLogin = (token: string) => {
    setJwt(token);
  };

  useEffect(() => {
    if (jwt) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwt;
      console.log('jwt set');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('jwt unset');
    }
  }, [jwt]);

  useEffect(() => {
    if (jwt && !user.id) {
      const fingerprintHash = getFingerprintHash(jwt);
      getProfile({ fingerprintHash })
        .then((response) => {
          const user = response.data.user;
          if (user) {
            setUser(user);
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
    <AuthContext.Provider value={{ user, setUser, jwt, setJwt, isLoggedIn, onLogin, onSignout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
