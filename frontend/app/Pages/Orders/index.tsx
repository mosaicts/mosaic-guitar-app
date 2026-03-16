import type { Route } from './+types/index';
import { useAuth } from '../../Providers/authProvider';
import './index.css';

export async function clientLoader({ params }: Route.LoaderArgs) {}

export async function clientAction({ params }: Route.ClientActionArgs) {}

export default function Guitars({ loaderData }: Route.ComponentProps) {
  const { user } = useAuth();
  return <div className="orders">{user?.username}'s orders:</div>;
}
