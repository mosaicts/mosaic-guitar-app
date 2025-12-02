import { NavLink } from 'react-router';
import { useAuth } from '@/Providers/authProvider';
import './index.css';
import ProfileDropdown from '@/Components/ProfileDropdown';

interface HeaderTypes {
  menuRef: React.RefObject<HTMLButtonElement | null>;
  isMobile: boolean;
  toggleNavMenu: () => void;
}

export default function Header({ menuRef, isMobile, toggleNavMenu }: HeaderTypes) {
  const { user } = useAuth();

  return (
    <div id="header">
      {isMobile && (
        <button id="menu" onClick={toggleNavMenu} ref={menuRef}>
          <span className="material-symbols-outlined" id="menu-icon">
            menu
          </span>
        </button>
      )}
      <header>
        <div id="left-header">
          <h2 id="logo">Mosaic</h2>
        </div>
        {
          // TODO: implement search bar
          // <div id="search-bar"></div>
        }
        <div id="right-header">
          <ProfileDropdown userFirstName={user.firstName} userLastName={user.lastName} />
          {
            // (
            // <div id="auth-nav">
            //   <NavLink id="login-navlink" to="/login">
            //     <p>Sign in</p>
            //   </NavLink>
            //   <NavLink id="register-navlink" to="/register">
            //     <p>Sign up</p>
            //   </NavLink>
            // </div>
            // )
          }
        </div>
      </header>
    </div>
  );
}
