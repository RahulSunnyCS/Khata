import { computeNetBalances, simplifyDebts, getSimplifiedDebts } from '../balances';
import type { Expense } from '../../types/expense.types';

function makeExpense(overrides: Partial<Expense> & Pick<Expense, 'payers' | 'splits'>): Expense {
  return {
    id: Math.random().toString(36).slice(2),
    groupId: 'g1',
    description: 'Test',
    totalAmount: overrides.payers.reduce((s, p) => s + p.amountPaid, 0),
    currency: 'INR',
    categoryId: 'general',
    splitType: 'EQUAL',
    expenseDate: new Date().toISOString(),
    receiptUrl: null,
    createdById: overrides.payers[0].userId,
    idempotencyKey: Math.random().toString(36),
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commentCount: 0,
    ...overrides,
  };
}

describe('computeNetBalances', () => {
  it('returns zero balances for an empty expense list', () => {
    expect(computeNetBalances([])).toEqual({});
  });

  it('calculates correct net for a single expense', () => {
    // alice pays ₹300; split equally 3 ways (₹100 each)
    const expense = makeExpense({
      payers: [{ userId: 'alice', amountPaid: 300 }],
      splits: [
        { userId: 'alice', owedAmount: 100 },
        { userId: 'bob', owedAmount: 100 },
        { userId: 'charlie', owedAmount: 100 },
      ],
    });
    const net = computeNetBalances([expense]);
    expect(net.alice).toBeCloseTo(200);    // paid 300, owes 100
    expect(net.bob).toBeCloseTo(-100);     // owes 100
    expect(net.charlie).toBeCloseTo(-100); // owes 100
  });

  it('aggregates multiple expenses correctly', () => {
    const e1 = makeExpense({
      payers: [{ userId: 'alice', amountPaid: 200 }],
      splits: [{ userId: 'alice', owedAmount: 100 }, { userId: 'bob', owedAmount: 100 }],
    });
    const e2 = makeExpense({
      payers: [{ userId: 'bob', amountPaid: 200 }],
      splits: [{ userId: 'alice', owedAmount: 100 }, { userId: 'bob', owedAmount: 100 }],
    });
    const net = computeNetBalances([e1, e2]);
    // alice: +200 (paid) -100 -100 (owed) = 0
    // bob:   +200 (paid) -100 -100 (owed) = 0
    expect(net.alice).toBeCloseTo(0);
    expect(net.bob).toBeCloseTo(0);
  });

  it('skips soft-deleted expenses', () => {
    const expense = makeExpense({
      payers: [{ userId: 'alice', amountPaid: 300 }],
      splits: [{ userId: 'bob', owedAmount: 300 }],
      deletedAt: new Date().toISOString(),
    });
    const net = computeNetBalances([expense]);
    expect(Object.keys(net)).toHaveLength(0);
  });
});

describe('simplifyDebts', () => {
  it('returns empty array when all balances are zero', () => {
    expect(simplifyDebts({ alice: 0, bob: 0 })).toEqual([]);
  });

  it('generates a single transfer for a two-person debt', () => {
    const result = simplifyDebts({ alice: 100, bob: -100 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ fromUserId: 'bob', toUserId: 'alice', amount: 100 });
  });

  it('reduces 3-way debt to at most 2 transfers', () => {
    // alice +200, bob -100, charlie -100
    const result = simplifyDebts({ alice: 200, bob: -100, charlie: -100 });
    expect(result.length).toBeLessThanOrEqual(2);
    // All debts should be cleared
    const totalOut = result.reduce((s, r) => s + r.amount, 0);
    expect(totalOut).toBeCloseTo(200);
  });

  it('reduces 4-way uneven debt to fewer than N-1 transfers where possible', () => {
    // alice +300, bob +100, charlie -200, dan -200
    const result = simplifyDebts({ alice: 300, bob: 100, charlie: -200, dan: -200 });
    expect(result.length).toBeLessThanOrEqual(3); // N-1 = 3 max
    const totalCredits = result.reduce((s, r) => s + r.amount, 0);
    expect(totalCredits).toBeCloseTo(400);
  });

  it('transfer amounts are always positive', () => {
    const result = simplifyDebts({ alice: 500, bob: -300, charlie: -200 });
    result.forEach((r) => expect(r.amount).toBeGreaterThan(0));
  });
});

describe('getSimplifiedDebts', () => {
  it('end-to-end: expense list → simplified debts', () => {
    const expense = makeExpense({
      payers: [{ userId: 'alice', amountPaid: 300 }],
      splits: [
        { userId: 'alice', owedAmount: 100 },
        { userId: 'bob', owedAmount: 100 },
        { userId: 'charlie', owedAmount: 100 },
      ],
    });
    const debts = getSimplifiedDebts([expense]);
    expect(debts.length).toBeLessThanOrEqual(2);
    debts.forEach((d) => {
      expect(d.toUserId).toBe('alice');
      expect(d.amount).toBe(100);
    });
  });
});
