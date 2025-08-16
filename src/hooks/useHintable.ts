import { useEffect, useRef } from 'react';
import { useHintContext } from './useHintContext';

export const useHintable = <T extends HTMLElement>(hintKey?: string) => {
  const ref = useRef<T>(null);
  const { registerHint, unregisterHint } = useHintContext();

  useEffect(() => {
    const element = ref.current;
    if (element && hintKey) {
      console.log('Registering hint:', hintKey, element); // Debug log
      registerHint(element, hintKey);
      return () => {
        console.log('Unregistering hint:', hintKey, element); // Debug log
        unregisterHint(element);
      };
    }
  }, [hintKey, registerHint, unregisterHint]);

  return ref;
};
