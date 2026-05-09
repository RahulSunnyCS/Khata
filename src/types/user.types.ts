export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  displayName: string;
  avatarUrl: string | null;
  defaultCurrency: string;
  vpa: string | null; // UPI Virtual Payment Address
  pushToken: string | null;
  createdAt: string;
}

export interface UserProfile extends User {
  totalOwed: number;
  totalOwing: number;
}

export type GhostMember = {
  isGhost: true;
  ghostName: string;
  ghostEmail: string | null;
  ghostPhone: string | null;
};

export type GroupMemberUser = User & { isGhost: false };

export type GroupMember = (GroupMemberUser | GhostMember) & {
  id: string;
  groupId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
};
