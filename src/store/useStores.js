import { useContext } from 'react';
import { AuthStoreContext, ChatStoreContext } from './storeContexts.js';

export const useAuthStore = (selector) => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('Auth store is not initialized');
  return store(selector);
};

export const useChatStore = (selector) => {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error('Chat store is not initialized');
  return store(selector);
};
