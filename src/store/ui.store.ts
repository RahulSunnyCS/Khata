import { create } from 'zustand';

interface UiState {
  isOnline: boolean;
  hasPendingSync: boolean;
  activeGroupId: string | null;

  setOnline: (online: boolean) => void;
  setPendingSync: (pending: boolean) => void;
  setActiveGroupId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isOnline: true,
  hasPendingSync: false,
  activeGroupId: null,

  setOnline: (isOnline) => set({ isOnline }),
  setPendingSync: (hasPendingSync) => set({ hasPendingSync }),
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
}));
