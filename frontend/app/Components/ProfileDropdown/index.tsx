import { NavLink } from 'react-router';
import { useState, useRef } from 'react';
import type * as CSS from 'csstype';
import { useAuth } from '@/Providers/authProvider';
import { nameToColour } from '@/lib/stringToColour';
import useClickOutside from '@/Hooks/useClickOutside';
import './index.css';

interface ProfileDropdownTypes {
  userFirstName: string;
  userLastName: string;
}

const ProfileDropdown = ({ userFirstName, userLastName }: ProfileDropdownTypes) => {
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const profileImageStyle = {
    backgroundColor: nameToColour(
      userFirstName + ' ' + userLastName
    ) as CSS.Property.BackgroundColor
  };

  useClickOutside(ref, () => {
    setDropdownOpen(false);
  });

  return (
    <div className="profile dropdown" ref={ref}>
      <button
        className="avatar"
        style={profileImageStyle}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        {user.avatar ? (
          <img src={user.avatar} />
        ) : (
          userFirstName !== '' && userFirstName[0].toUpperCase() + userLastName[0].toUpperCase()
        )}
      </button>
      {isDropdownOpen && (
        <div className="menu dropdown" role="menu">
          <NavLink to="/profile">My profile</NavLink>
          <hr></hr>
          <NavLink to="/signout">Sign out</NavLink>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
