import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import useWindowWidth from '@/Hooks/useWindowWidth';
import Header from './Header';
import './index.css';

export default function OuterLayout() {
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const [isNavOpen, setNavOpen] = useState(false);
  const [isNavCollapsed, setNavCollapsed] = useState(true); // collapse nav by default in mobile view (ie, removing the nav from the DOM)
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const navState = !isMobile ? '' : isNavOpen ? 'slide-in' : 'slide-out';

  useEffect(() => {
    // this only run once at the start of the new view (mobile or desktop)
    // don't collapse nav if previously opened
    if (isMobile && !isNavOpen) {
      setNavCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div id="outer-layout">
      <Header
        menuRef={menuRef}
        isMobile={isMobile}
        toggleNavMenu={() => {
          // user click then stop collapsing nav
          if (isNavCollapsed) {
            setNavCollapsed(false);
          }
          setNavOpen(!isNavOpen);
        }}
      />
      <div id="inner-layout">
        <Outlet context={{ menuRef, isMobile, navState, isNavCollapsed, isNavOpen, setNavOpen }} />
      </div>
    </div>
  );
}
