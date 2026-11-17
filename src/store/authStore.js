import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: window.localStorage.getItem('token'),
      username: null,
      setAuth: (token, username) => {
        window.localStorage.setItem('token', token);
        set({ token, username });
      },
      logout: () => {
        window.localStorage.removeItem('token');
        set({ token: null, username: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);

export default useAuthStore;
