export type SplitType =
  | 'EQUAL'
  | 'EXACT'
  | 'PERCENTAGE'
  | 'SHARES'
  | 'ADJUSTMENT'
  | 'ITEMISED';

export type PaymentMethod = 'CASH' | 'ONLINE' | 'UPI';

export interface ExpensePayer {
  userId: string;
  amountPaid: number;
}

export interface ExpenseSplit {
  userId: string;
  owedAmount: number;
  splitMetadata?: Record<string, unknown>; // raw %, shares, adjustments
}

export interface ExpenseLineItem {
  name: string;
  amount: number;
  assignedUserIds: string[];
}

export interface Expense {
  id: string;
  groupId: string | null;
  description: string;
  totalAmount: number;
  currency: string;
  categoryId: string;
  splitType: SplitType;
  expenseDate: string;
  receiptUrl: string | null;
  createdById: string;
  idempotencyKey: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
  commentCount: number;
}

export interface CreateExpensePayload {
  groupId?: string;
  description: string;
  totalAmount: number;
  currency: string;
  categoryId: string;
  splitType: SplitType;
  expenseDate: string;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
  lineItems?: ExpenseLineItem[];
  idempotencyKey: string;
}

export interface Comment {
  id: string;
  expenseId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  body: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  groupId: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  note: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  iconName: string;
  colourHex: string;
  isSystem: boolean;
}

export interface ActivityItem {
  id: string;
  type:
    | 'EXPENSE_ADDED'
    | 'EXPENSE_UPDATED'
    | 'EXPENSE_DELETED'
    | 'PAYMENT_RECORDED'
    | 'MEMBER_JOINED'
    | 'MEMBER_LEFT'
    | 'GROUP_CREATED'
    | 'COMMENT_ADDED';
  actorId: string;
  actorName: string;
  groupId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
