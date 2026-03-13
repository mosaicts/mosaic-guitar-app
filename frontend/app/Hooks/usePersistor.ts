import { useState, useEffect, useRef } from 'react';
import { type User } from '@/utils/models';

export class LocalStorageManager<T> {
  _storage;

  constructor(isSsr: boolean) {
    // console.log('load storage');
    // console.log({ isSsr });
    this._storage = isSsr ? null : window.sessionStorage;
  }

  get(key: string) {
    if (!this._storage) {
      console.log('storage is still null');
      return null;
    }
    console.log('get from storage...');
    const value = this._storage.getItem(key);
    return typeof value === 'string' ? (value as T) : null;
  }

  set(key: string, value: T) {
    if (typeof value === 'object') {
      // this._storage.setItem(key, JSON.stringify(value));
      return;
    } else if (typeof value === 'string' && this._storage) {
      this._storage.setItem(key, value);
    }
  }

  remove(key: string) {
    if (this._storage) {
      this._storage.removeItem(key);
    }
  }
}

export function useDriver<T>(isSsr: boolean) {
  // const isSsr = false;
  // const driver = new LocalStorageManager<string>(isSsr);
  // const userDriver = new LocalStorageManager<User>(isSsr);

  // TODO: optimize to prevent creating new object when re-rendering
  const driver = new LocalStorageManager<T>(isSsr);
  return driver;
}

export default function usePersistor<T>(
  key: string,
  initialData: T,
  driver: LocalStorageManager<T>,
  isSsr: boolean
): [T, (data: T) => void] {
  const [storedData, _setStoredData] = useState<T>(() => initialData);
  const _channel = useRef(new BroadcastChannel(key)).current;

  const _readValue = () => {
    const value = driver.get(key);
    return value ?? initialData;
  };

  const setValue = (data: T) => {
    driver.set(key, data);
    _setStoredData(data);
    console.log('set data');
    _channel.postMessage({ message: 'UPDATE', key, data });
  };

  useEffect(() => {
    console.log(`get ${key} data`);
    const value = _readValue();
    console.log('set data');
    _setStoredData(value);
    _channel.postMessage({ message: 'UPDATE', key, data: value });
  }, [isSsr]);

  useEffect(() => {
    console.log('set data to storage');
    driver.set(key, storedData);
  }, [storedData]);

  useEffect(() => {
    function _listener(e: MessageEvent) {
      switch (e.data.message) {
        case 'UPDATE':
          console.log('receive data:', e.data);
          console.log('set received data');
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
