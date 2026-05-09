import { create } from 'zustand';
import type { Group, GroupDetail, GroupBalance, SimplifiedDebt } from '../types/group.types';

interface GroupsState {
  groups: Group[];
  groupDetails: Record<string, GroupDetail>;
  groupBalances: Record<string, GroupBalance[]>;
  simplifiedDebts: Record<string, SimplifiedDebt[]>;
  isLoading: boolean;

  setGroups: (groups: Group[]) => void;
  upsertGroup: (group: Group) => void;
  setGroupDetail: (id: string, detail: GroupDetail) => void;
  setGroupBalances: (id: string, balances: GroupBalance[]) => void;
  setSimplifiedDebts: (id: string, debts: SimplifiedDebt[]) => void;
  removeGroup: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  groups: [],
  groupDetails: {},
  groupBalances: {},
  simplifiedDebts: {},
  isLoading: false,
};

export const useGroupsStore = create<GroupsState>((set) => ({
  ...initialState,

  setGroups: (groups) => set({ groups }),

  upsertGroup: (group) =>
    set((state) => {
      const exists = state.groups.findIndex((g) => g.id === group.id);
      if (exists >= 0) {
        const updated = [...state.groups];
        updated[exists] = group;
        return { groups: updated };
      }
      return { groups: [group, ...state.groups] };
    }),

  setGroupDetail: (id, detail) =>
    set((state) => ({ groupDetails: { ...state.groupDetails, [id]: detail } })),

  setGroupBalances: (id, balances) =>
    set((state) => ({ groupBalances: { ...state.groupBalances, [id]: balances } })),

  setSimplifiedDebts: (id, debts) =>
    set((state) => ({ simplifiedDebts: { ...state.simplifiedDebts, [id]: debts } })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
