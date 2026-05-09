import type { ExpensePayer, ExpenseSplit, ExpenseLineItem, SplitType } from '../types/expense.types';

export interface SplitInput {
  type: SplitType;
  totalAmount: number;
  participantIds: string[];
  // EXACT: map userId → exact amount
  exactAmounts?: Record<string, number>;
  // PERCENTAGE: map userId → percentage (must sum to 100)
  percentages?: Record<string, number>;
  // SHARES: map userId → share count (e.g. 2, 1, 1)
  shares?: Record<string, number>;
  // ADJUSTMENT: map userId → +/- adjustment on top of equal base
  adjustments?: Record<string, number>;
  // ITEMISED: line items with per-item assignees
  lineItems?: ExpenseLineItem[];
  // EQUAL: single payer covers all
  payerId: string;
}

export interface SplitResult {
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
}

// Distributes a remainder of pennies to early participants (index 0, 1, …)
function distributeRemainder(amounts: number[], totalMinorUnits: number): number[] {
  const sumMinor = amounts.reduce((s, a) => s + Math.round(a * 100), 0);
  let diff = totalMinorUnits - sumMinor; // in paise/pence
  const result = amounts.map((a) => Math.round(a * 100));
  let i = 0;
  while (diff > 0) { result[i % result.length]++; diff--; i++; }
  while (diff < 0) { result[i % result.length]--; diff++; i++; }
  return result.map((v) => v / 100);
}

export function calculateSplit(input: SplitInput): SplitResult {
  const { type, totalAmount, participantIds, payerId } = input;
  const payers: ExpensePayer[] = [{ userId: payerId, amountPaid: totalAmount }];
  const n = participantIds.length;

  switch (type) {
    case 'EQUAL': {
      const base = Math.floor((totalAmount * 100) / n) / 100;
      const amounts = distributeRemainder(
        Array(n).fill(base),
        Math.round(totalAmount * 100),
      );
      return {
        payers,
        splits: participantIds.map((id, i) => ({ userId: id, owedAmount: amounts[i] })),
      };
    }

    case 'EXACT': {
      const exact = input.exactAmounts ?? {};
      const sum = Object.values(exact).reduce((s, v) => s + v, 0);
      if (Math.abs(sum - totalAmount) > 0.01) {
        throw new Error(`Exact amounts sum (${sum}) does not equal total (${totalAmount})`);
      }
      return {
        payers,
        splits: participantIds.map((id) => ({ userId: id, owedAmount: exact[id] ?? 0 })),
      };
    }

    case 'PERCENTAGE': {
      const pcts = input.percentages ?? {};
      const sumPct = Object.values(pcts).reduce((s, v) => s + v, 0);
      if (Math.abs(sumPct - 100) > 0.01) {
        throw new Error(`Percentages must sum to 100, got ${sumPct}`);
      }
      const rawAmounts = participantIds.map((id) => (pcts[id] ?? 0) / 100 * totalAmount);
      const distributed = distributeRemainder(rawAmounts, Math.round(totalAmount * 100));
      return {
        payers,
        splits: participantIds.map((id, i) => ({
          userId: id,
          owedAmount: distributed[i],
          splitMetadata: { percentage: pcts[id] ?? 0 },
        })),
      };
    }

    case 'SHARES': {
      const shares = input.shares ?? {};
      const totalShares = Object.values(shares).reduce((s, v) => s + v, 0);
      if (totalShares === 0) throw new Error('Total shares must be > 0');
      const rawAmounts = participantIds.map((id) => (shares[id] ?? 0) / totalShares * totalAmount);
      const distributed = distributeRemainder(rawAmounts, Math.round(totalAmount * 100));
      return {
        payers,
        splits: participantIds.map((id, i) => ({
          userId: id,
          owedAmount: distributed[i],
          splitMetadata: { shares: shares[id] ?? 0 },
        })),
      };
    }

    case 'ADJUSTMENT': {
      const adjustments = input.adjustments ?? {};
      const totalAdj = Object.values(adjustments).reduce((s, v) => s + v, 0);
      const base = (totalAmount - totalAdj) / n;
      if (base < 0) throw new Error('Adjustments exceed total amount');
      const rawAmounts = participantIds.map((id) => base + (adjustments[id] ?? 0));
      const distributed = distributeRemainder(rawAmounts, Math.round(totalAmount * 100));
      return {
        payers,
        splits: participantIds.map((id, i) => ({
          userId: id,
          owedAmount: distributed[i],
          splitMetadata: { adjustment: adjustments[id] ?? 0 },
        })),
      };
    }

    case 'ITEMISED': {
      const items = input.lineItems ?? [];
      const owedMap: Record<string, number> = {};
      for (const id of participantIds) owedMap[id] = 0;
      for (const item of items) {
        const perPerson = item.amount / item.assignedUserIds.length;
        for (const id of item.assignedUserIds) {
          owedMap[id] = (owedMap[id] ?? 0) + perPerson;
        }
      }
      const sum = Object.values(owedMap).reduce((s, v) => s + v, 0);
      if (Math.abs(sum - totalAmount) > 0.01) {
        throw new Error(`Line items sum (${sum}) does not equal total (${totalAmount})`);
      }
      return {
        payers,
        splits: participantIds.map((id) => ({ userId: id, owedAmount: owedMap[id] ?? 0 })),
      };
    }
  }
}

export function validateSplitInput(input: SplitInput): string | null {
  if (input.totalAmount <= 0) return 'Amount must be greater than 0';
  if (input.participantIds.length === 0) return 'At least one participant is required';
  if (input.type === 'PERCENTAGE' && !input.percentages) return 'Percentages are required';
  if (input.type === 'EXACT' && !input.exactAmounts) return 'Exact amounts are required';
  if (input.type === 'SHARES' && !input.shares) return 'Shares are required';
  if (input.type === 'ITEMISED' && (!input.lineItems || input.lineItems.length === 0)) {
    return 'Line items are required';
  }
  return null;
}
