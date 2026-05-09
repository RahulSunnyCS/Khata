import { api } from './api';
import type { Group, GroupDetail, GroupBalance, SimplifiedDebt, CreateGroupPayload, InviteLink } from '../types/group.types';
import type { GroupMember } from '../types/user.types';

export const groupsService = {
  list: () => api.get<Group[]>('/groups'),

  get: (id: string) => api.get<GroupDetail>(`/groups/${id}`),

  create: (payload: CreateGroupPayload) => api.post<Group>('/groups', payload),

  update: (id: string, payload: Partial<CreateGroupPayload>) =>
    api.patch<Group>(`/groups/${id}`, payload),

  archive: (id: string) => api.post<void>(`/groups/${id}/archive`),

  delete: (id: string) => api.delete<void>(`/groups/${id}`),

  getMembers: (id: string) => api.get<GroupMember[]>(`/groups/${id}/members`),

  addMember: (id: string, payload: { email?: string; phone?: string; ghost?: boolean; ghostName?: string }) =>
    api.post<GroupMember>(`/groups/${id}/members`, payload),

  removeMember: (groupId: string, userId: string) =>
    api.delete<void>(`/groups/${groupId}/members/${userId}`),

  getBalances: (id: string) =>
    api.get<{ raw: GroupBalance[]; simplified: SimplifiedDebt[] }>(`/groups/${id}/balances`),

  generateInvite: (id: string) => api.post<InviteLink>(`/groups/${id}/invite`),

  joinViaInvite: (token: string) => api.post<Group>(`/groups/join/${token}`),
};
