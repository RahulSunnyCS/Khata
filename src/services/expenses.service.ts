import { api } from './api';
import type { Expense, CreateExpensePayload, Comment, Payment, ActivityItem, Category } from '../types/expense.types';

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export const expensesService = {
  listByGroup: (groupId: string, cursor?: string) =>
    api.get<PaginatedResponse<Expense>>(
      `/groups/${groupId}/expenses${cursor ? `?cursor=${cursor}` : ''}`,
    ),

  get: (id: string) => api.get<Expense>(`/expenses/${id}`),

  create: (payload: CreateExpensePayload) => api.post<Expense>('/expenses', payload),

  update: (id: string, payload: Partial<CreateExpensePayload>) =>
    api.patch<Expense>(`/expenses/${id}`, payload),

  delete: (id: string) => api.delete<void>(`/expenses/${id}`),

  getComments: (expenseId: string) =>
    api.get<Comment[]>(`/expenses/${expenseId}/comments`),

  addComment: (expenseId: string, body: string) =>
    api.post<Comment>(`/expenses/${expenseId}/comments`, { body }),

  uploadReceipt: async (expenseId: string, uri: string): Promise<Expense> => {
    const formData = new FormData();
    formData.append('receipt', { uri, name: 'receipt.jpg', type: 'image/jpeg' } as unknown as Blob);

    const accessToken = await import('../lib/storage').then((m) => m.Storage.getSecure('accessToken'));
    const res = await fetch(
      `${(await import('../constants/config')).Config.apiBaseUrl}/expenses/${expenseId}/receipt`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: formData,
      },
    );
    if (!res.ok) throw new Error('Receipt upload failed');
    return res.json() as Promise<Expense>;
  },

  listPayments: () => api.get<Payment[]>('/payments'),

  recordPayment: (payload: Omit<Payment, 'id' | 'createdAt'>) =>
    api.post<Payment>('/payments', payload),

  getActivity: (cursor?: string) =>
    api.get<PaginatedResponse<ActivityItem>>(
      `/activity${cursor ? `?cursor=${cursor}` : ''}`,
    ),

  getGroupActivity: (groupId: string, cursor?: string) =>
    api.get<PaginatedResponse<ActivityItem>>(
      `/groups/${groupId}/activity${cursor ? `?cursor=${cursor}` : ''}`,
    ),

  sendPoke: (toUserId: string, groupId?: string) =>
    api.post<void>('/notifications/poke', { toUserId, groupId }),

  getCategories: () => api.get<Category[]>('/categories'),

  getGlobalBalances: () =>
    api.get<{ totalOwed: number; totalOwing: number; byUser: Record<string, number> }>('/balances'),
};
