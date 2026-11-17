import { create } from 'zustand';

const useChatStore = create((set) => ({
  currentChannelId: null,
  setCurrentChannelId: (currentChannelId) => set({ currentChannelId }),
}));

export default useChatStore;
