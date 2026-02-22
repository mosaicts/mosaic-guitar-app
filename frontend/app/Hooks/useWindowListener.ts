import { useEffect } from 'react';

const useWindowListener = (eventType: string, listener: () => void) => {
  useEffect(() => {
    window.addEventListener(eventType, listener);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener(eventType, listener);
    };
  }, []);
};

export default useWindowListener;
