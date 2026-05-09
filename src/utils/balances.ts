import type { Expense } from '../types/expense.types';

export interface Balance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Compute raw per-user net balance within a group from a list of expenses.
 * Positive = is owed money; negative = owes money.
 */
export function computeNetBalances(expenses: Expense[]): Record<string, number> {
  const net: Record<string, number> = {};

  for (const expense of expenses) {
    if (expense.deletedAt) continue;

    for (const payer of expense.payers) {
      net[payer.userId] = (net[payer.userId] ?? 0) + payer.amountPaid;
    }
    for (const split of expense.splits) {
      net[split.userId] = (net[split.userId] ?? 0) - split.owedAmount;
    }
  }

  return net;
}

/**
 * Greedy minimum-transaction simplify-debts algorithm.
 * Reduces up to N*(N-1) raw payments to at most N-1 simplified transfers.
 *
 * Based on: net-balance redistribution via max-creditor / max-debtor pairing.
 */
export function simplifyDebts(netBalances: Record<string, number>): Balance[] {
  // Work in integer paise to avoid floating-point drift
  const balances = Object.entries(netBalances).map(([userId, amount]) => ({
    userId,
    amount: Math.round(amount * 100),
  }));

  const result: Balance[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const maxCreditor = balances.reduce((a, b) => (b.amount > a.amount ? b : a));
    const maxDebtor = balances.reduce((a, b) => (b.amount < a.amount ? b : a));

    if (maxCreditor.amount <= 0 || maxDebtor.amount >= 0) break;

    const settled = Math.min(maxCreditor.amount, -maxDebtor.amount);
    maxCreditor.amount -= settled;
    maxDebtor.amount += settled;

    result.push({
      fromUserId: maxDebtor.userId,
      toUserId: maxCreditor.userId,
      amount: settled / 100,
    });
  }

  return result;
}

/**
 * Given a list of expenses, return the full simplified debt list for the group.
 */
export function getSimplifiedDebts(expenses: Expense[]): Balance[] {
  return simplifyDebts(computeNetBalances(expenses));
}
