import { NavLink } from 'react-router';
import { useRef } from 'react';
import useClickOutside from '@/Hooks/useClickOutside';
import './index.css';

interface NavbarTypes {
  navState: string;
  onClickOutside: (event?: MouseEvent) => void;
}

export default function Navbar({ navState, onClickOutside }: NavbarTypes) {
  const ref = useRef<HTMLDivElement | null>(null);

  useClickOutside(ref, onClickOutside);

  return (
    <div id="sidebar" ref={ref}>
      <nav className={navState} role="menu">
        <NavLink id="home-nav" to="/">
          <HomeNav />
        </NavLink>
        <NavLink id="orders-nav" to="/orders">
          <OrdersNav />
        </NavLink>
      </nav>
    </div>
  );
}

function HomeNav() {
  return (
    <div>
      <span className="material-symbols-outlined">home</span>
      <p>Home</p>
    </div>
  );
}

function OrdersNav() {
  return (
    <div>
      <span className="material-symbols-outlined">orders</span>
      <p>Orders</p>
    </div>
  );
}
