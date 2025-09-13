// src/hooks/usePersisted.ts
// Hook de estado persistido (localStorage/sessionStorage) com:
// - SSR safe (checa window)
// - try/catch em todas as operações
// - sincronização entre abas (window 'storage')
// - API flexível (escolha storage, parse/serialize custom)
// - remove() para apagar a chave

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

type UsePersistedOptions<T> = {
  storage?: Storage | 'local' | 'session'; // default: localStorage
  sync?: boolean;                           // sincroniza entre abas? default: true
  serialize?: (v: T) => string;             // default: JSON.stringify
  deserialize?: (raw: string) => T;         // default: JSON.parse
};

function getStorage(opt?: UsePersistedOptions<any>): Storage | null {
  if (typeof window === 'undefined') return null;
  const s = opt?.storage ?? 'local';
  try {
    if (s === 'local') return window.localStorage;
    if (s === 'session') return window.sessionStorage;
    return s; // já é um Storage
  } catch {
    return null;
  }
}

export function usePersisted<T>(
  key: string,
  initial: T,
  opt?: UsePersistedOptions<T>
) {
  const storage = getStorage(opt);
  const serialize = opt?.serialize ?? ((v: T) => JSON.stringify(v));
  const deserialize = opt?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);
  const sync = opt?.sync ?? true;

  // Evita serializar o initial a cada render
  const initialRef = useRef(initial);

  const read = useCallback((): T => {
    if (!storage) return initialRef.current;
    try {
      const raw = storage.getItem(key);
      if (raw == null) return initialRef.current;
      return deserialize(raw);
    } catch {
      return initialRef.current;
    }
  }, [storage, key, deserialize]);

  const [value, setValue] = useState<T>(() => read());

  // Gravar quando value muda
  useEffect(() => {
    if (!storage) return;
    try {
      storage.setItem(key, serialize(value));
    } catch {
      // quota cheia, modo privativo etc.
      // opcional: console.error('Persist error', e)
    }
  }, [storage, key, value, serialize]);

  // Sync entre abas
  useEffect(() => {
    if (!storage || !sync || typeof window === 'undefined') return;

    const handler = (e: StorageEvent) => {
      if (e.storageArea === storage && e.key === key) {
        // se removeram a chave em outra aba, volta pro initial
        if (e.newValue == null) {
          setValue(initialRef.current);
        } else {
          try {
            setValue(deserialize(e.newValue));
          } catch {
            // ignora parse fail
          }
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storage, key, deserialize, sync]);

  // setValue seguro (aceita função updater)
  const setPersisted = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue(prev => (typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater));
    },
    []
  );

  // remover a chave do storage e resetar para initial
  const remove = useCallback(() => {
    if (storage) {
      try { storage.removeItem(key); } catch {}
    }
    setValue(initialRef.current);
  }, [storage, key]);

  return useMemo(() => [value, setPersisted, { remove }] as const, [value, setPersisted, remove]);
}
