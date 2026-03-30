import { Outlet, useOutletContext } from 'react-router';
import Navbar from './Navbar';
import './index.css';

export type ContextType = {
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
              // console.log({ event: event?.target });
              if (
                isMobile &&
                // click in the menu icon to open the nav will not run this
                // because toggleNav logic is already run in Header component
                menuRef.current &&
                !menuRef.current.contains(event?.target as HTMLElement)
              ) {
                setNavOpen(false); // close the nav
              }
            }}
          />
        )
      }
      {isMobile && isNavOpen && <div className="background"></div>}
      <Outlet />
    </>
  );
}
