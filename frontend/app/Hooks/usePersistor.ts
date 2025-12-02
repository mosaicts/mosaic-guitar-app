import { useState, useEffect, useRef } from 'react';
import { type User } from '../utils/models';

export class LocalStorageManager<T> {
  _storage;

  constructor() {
    this._storage = window.sessionStorage;
  }

  get(key: string) {
    const value = this._storage.getItem(key);
    return typeof value === 'string' ? (value as T) : null;
  }

  set(key: string, value: T) {
    if (typeof value === 'object') {
      // this._storage.setItem(key, JSON.stringify(value));
    } else if (typeof value === 'string') {
      this._storage.setItem(key, value);
    }
  }

  remove(key: string) {
    this._storage.removeItem(key);
  }
}

export function useDriver() {
  const driver = useRef(new LocalStorageManager<string>()).current;
  const userDriver = useRef(new LocalStorageManager<User>()).current;
  return [driver, userDriver];
}

export default function usePersistor<T>(
  key: string,
  initialData: T,
  driver: LocalStorageManager<T>
): [T, (data: T) => void] {
  const [storedData, _setStoredData] = useState<T>(() => {
    const value = driver.get(key);
    return value ?? initialData;
  });
  const _channel = useRef(new BroadcastChannel(key)).current;

  const setValue = (data: T) => {
    driver.set(key, data);
    _setStoredData(data);
    _channel.postMessage({ message: key, data });
  };

  useEffect(() => {
    _channel.postMessage({ message: 'NEW_TAB' });
  }, []);

  useEffect(() => {
    function _listener(e: MessageEvent) {
      switch (e.data.message) {
        case 'NEW_TAB':
          // console.log('send to new tab', storedData);
          _channel.postMessage({ message: key, data: storedData });
          break;
        case key:
          // console.log('receive data:', e.data);
          _setStoredData(e.data.data);
          break;
      }
    }

    _channel.addEventListener('message', _listener);

    return () => {
      _channel.removeEventListener('message', _listener);
    };
  }, [storedData]);

  return [storedData, setValue];
}
