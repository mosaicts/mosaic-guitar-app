import { Outlet, useOutletContext } from 'react-router';
import Navbar from './Navbar';
import './index.css';

type ContextType = {
  menuRef: React.RefObject<HTMLButtonElement | null>;
  navState: string;
  isMobile: boolean;
  isNavCollapsed: boolean;
  isNavOpen: boolean;
  setNavOpen: (value: boolean) => void;
};

export default function InnerLayout() {
  const { menuRef, isMobile, navState, isNavCollapsed, isNavOpen, setNavOpen } =
    useOutletContext<ContextType>();

  return (
    <>
      {
        // if nav is not collapsed in mobile view then show the nav
        (!isMobile || !isNavCollapsed) && (
          <Navbar
            navState={navState}
            onClickOutside={(event?: MouseEvent) => {
              if (
                isMobile &&
                // click in the menu will not run this
                menuRef.current &&
                !menuRef.current.contains(event?.target as HTMLElement)
              ) {
                setNavOpen(false); // close the nav
              }
            }}
          />
        )
      }
      {isMobile && isNavOpen && <div className="modal-bg"></div>}
      <Outlet />
    </>
  );
}
