import type { GroupMember } from './user.types';

export type GroupType = 'TRIP' | 'HOME' | 'COUPLE' | 'OTHER';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  defaultCurrency: string;
  simplifyDebts: boolean;
  creatorId: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  lastActivityAt: string | null;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  myBalance: number;
}

export interface GroupBalance {
  userId: string;
  displayName: string;
  amount: number;
  currency: string;
}

export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

export interface CreateGroupPayload {
  name: string;
  type: GroupType;
  defaultCurrency: string;
}

export interface InviteLink {
  token: string;
  expiresAt: string;
  url: string;
}
