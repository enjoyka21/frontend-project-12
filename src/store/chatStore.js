import { create } from 'zustand';

export const createChatStore = () => create((set) => ({
  currentChannelId: null,
  setCurrentChannelId: (currentChannelId) => set({ currentChannelId }),
}));
