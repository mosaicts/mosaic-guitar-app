import { NavLink } from 'react-router';
import { useState, useRef } from 'react';
import type * as CSS from 'csstype';
import { nameToColour } from '@/lib/stringToColour';
import useClickOutside from '@/Hooks/useClickOutside';
import './index.css';

interface ProfileDropdownTypes {
  userFirstName: string;
  userLastName: string;
}

const ProfileDropdown = ({ userFirstName, userLastName }: ProfileDropdownTypes) => {
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
    <div id="profile-dropdown" ref={ref}>
      <button
        id="profile-image"
        style={profileImageStyle}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        {userFirstName !== '' && userFirstName[0].toUpperCase() + userLastName[0].toUpperCase()}
      </button>
      {isDropdownOpen && (
        <div id="dropdown-menu" role="menu">
          <NavLink to="/profile">My profile</NavLink>
          <hr></hr>
          <NavLink to="/signout">Sign out</NavLink>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
