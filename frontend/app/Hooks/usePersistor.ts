import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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
  const driver = useMemo(() => new LocalStorageManager<T>(isSsr), [isSsr]);
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

  const setValue = useCallback(
    (data: T) => {
      driver.set(key, data);
      _setStoredData(data);
      console.log('set data');
      _channel.postMessage({ message: 'UPDATE', key, data });
    },
    [driver, key]
  );

  useEffect(() => {
    const _readValue = () => {
      const value = driver.get(key);
      return value ?? initialData;
    };

    console.log(`get ${key} data`);
    const value = _readValue();
    console.log(`set ${key} data`);
    _setStoredData(value);
    _channel.postMessage({ message: 'UPDATE', key, data: value });
  }, [isSsr, driver]);

  useEffect(() => {
    // sync updated data, from another tab etc
    console.log('set data to storage');
    console.log({ storedData });
    if (storedData) driver.set(key, storedData);
  }, [storedData, driver]);

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
