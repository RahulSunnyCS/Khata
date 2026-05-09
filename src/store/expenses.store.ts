import { create } from 'zustand';
import type { Expense, Payment, ActivityItem, Category } from '../types/expense.types';

interface PendingExpense {
  payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
  queuedAt: number;
}

interface ExpensesState {
  // keyed by groupId; null key = direct friend expenses
  expensesByGroup: Record<string, Expense[]>;
  payments: Payment[];
  activity: ActivityItem[];
  categories: Category[];
  // offline queue
  pendingExpenses: PendingExpense[];
  isLoading: boolean;

  setGroupExpenses: (groupId: string, expenses: Expense[]) => void;
  upsertExpense: (expense: Expense) => void;
  removeExpense: (id: string, groupId: string | null) => void;
  setPayments: (payments: Payment[]) => void;
  appendActivity: (items: ActivityItem[]) => void;
  setCategories: (categories: Category[]) => void;
  enqueuePending: (expense: PendingExpense) => void;
  dequeuePending: (idempotencyKey: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  expensesByGroup: {},
  payments: [],
  activity: [],
  categories: [],
  pendingExpenses: [],
  isLoading: false,
};

export const useExpensesStore = create<ExpensesState>((set) => ({
  ...initialState,

  setGroupExpenses: (groupId, expenses) =>
    set((state) => ({ expensesByGroup: { ...state.expensesByGroup, [groupId]: expenses } })),

  upsertExpense: (expense) =>
    set((state) => {
      const key = expense.groupId ?? '__direct__';
      const list = state.expensesByGroup[key] ?? [];
      const idx = list.findIndex((e) => e.id === expense.id);
      const updated = idx >= 0 ? [...list] : [expense, ...list];
      if (idx >= 0) updated[idx] = expense;
      return { expensesByGroup: { ...state.expensesByGroup, [key]: updated } };
    }),

  removeExpense: (id, groupId) =>
    set((state) => {
      const key = groupId ?? '__direct__';
      const list = state.expensesByGroup[key] ?? [];
      return {
        expensesByGroup: {
          ...state.expensesByGroup,
          [key]: list.filter((e) => e.id !== id),
        },
      };
    }),

  setPayments: (payments) => set({ payments }),

  appendActivity: (items) =>
    set((state) => ({ activity: [...items, ...state.activity] })),

  setCategories: (categories) => set({ categories }),

  enqueuePending: (expense) =>
    set((state) => ({ pendingExpenses: [...state.pendingExpenses, expense] })),

  dequeuePending: (idempotencyKey) =>
    set((state) => ({
      pendingExpenses: state.pendingExpenses.filter(
        (e) => e.payload.idempotencyKey !== idempotencyKey,
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
