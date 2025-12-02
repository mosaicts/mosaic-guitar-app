import { useEffect, useRef } from 'react';

const useGlobalSignout = (onSingleSignout: () => void) => {
  const _channel = useRef(new BroadcastChannel('signout')).current;

  const onSignout = () => {
    onSingleSignout();
    _channel.postMessage({ message: 'SIGNOUT' });
    console.log('signout end');
  };

  useEffect(() => {
    function _listener(e: MessageEvent) {
      // console.log('receive data:', e.data);
      switch (e.data.message) {
        case 'SIGNOUT':
          onSingleSignout();
          break;
      }
    }

    _channel.addEventListener('message', _listener);

    return () => {
      _channel.removeEventListener('message', _listener);
    };
  }, []);

  return onSignout;
};

export default useGlobalSignout;
