import type { Route } from './+types/index';
import { useAuth } from '../../Providers/authProvider';
import './index.css';

export default function Orders() {
  const { user } = useAuth();
  return <div className="orders">{user?.username}'s orders:</div>;
}
