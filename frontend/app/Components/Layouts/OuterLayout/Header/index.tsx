import { useAuth } from '@/Providers/authProvider';
import './index.css';
import ProfileDropdown from '@/Components/ProfileDropdown';

interface HeaderTypes {
  menuRef: React.RefObject<HTMLButtonElement | null>;
  isMobile: boolean;
  toggleNav: () => void;
}

export default function Header({ menuRef, isMobile, toggleNav }: HeaderTypes) {
  const { user } = useAuth();

  return (
    <div className="header">
      {isMobile && (
        <button className="menu" onClick={toggleNav} ref={menuRef}>
          <span className="material-symbols-outlined" id="menu-icon">
            menu
          </span>
        </button>
      )}
      <header>
        <div className="header left">
          <h2 className="logo">Mosaic</h2>
        </div>
        {
          // TODO: implement search bar
          // <div className="search"></div>
        }
        <div className="header right">
          <ProfileDropdown userFirstName={user.firstName} userLastName={user.lastName} />
        </div>
      </header>
    </div>
  );
}
