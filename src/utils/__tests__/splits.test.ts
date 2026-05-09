import { calculateSplit, validateSplitInput } from '../splits';

const PARTICIPANTS = ['alice', 'bob', 'charlie'];

// Helper to sum splits and verify it equals totalAmount
function assertSplitsSumToTotal(splits: { owedAmount: number }[], total: number) {
  const sum = splits.reduce((s, sp) => s + sp.owedAmount, 0);
  expect(Math.abs(sum - total)).toBeLessThanOrEqual(0.01);
}

describe('calculateSplit — EQUAL', () => {
  it('divides evenly when divisible', () => {
    const { splits } = calculateSplit({
      type: 'EQUAL',
      totalAmount: 300,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
    });
    expect(splits).toHaveLength(3);
    splits.forEach((s) => expect(s.owedAmount).toBe(100));
  });

  it('assigns remainder to first participant when not evenly divisible', () => {
    const { splits } = calculateSplit({
      type: 'EQUAL',
      totalAmount: 100,
      participantIds: ['alice', 'bob', 'charlie'],
      payerId: 'alice',
    });
    assertSplitsSumToTotal(splits, 100);
    // remainder (₹0.01 × 1) goes to alice
    expect(splits[0].owedAmount).toBeCloseTo(33.34, 2);
    expect(splits[1].owedAmount).toBeCloseTo(33.33, 2);
    expect(splits[2].owedAmount).toBeCloseTo(33.33, 2);
  });

  it('works for a single participant (pays themselves)', () => {
    const { splits } = calculateSplit({
      type: 'EQUAL',
      totalAmount: 500,
      participantIds: ['alice'],
      payerId: 'alice',
    });
    expect(splits[0].owedAmount).toBe(500);
  });

  it('sets payer correctly', () => {
    const { payers } = calculateSplit({
      type: 'EQUAL',
      totalAmount: 200,
      participantIds: ['alice', 'bob'],
      payerId: 'bob',
    });
    expect(payers).toEqual([{ userId: 'bob', amountPaid: 200 }]);
  });
});

describe('calculateSplit — EXACT', () => {
  it('assigns specified amounts', () => {
    const { splits } = calculateSplit({
      type: 'EXACT',
      totalAmount: 300,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
      exactAmounts: { alice: 150, bob: 100, charlie: 50 },
    });
    expect(splits.find((s) => s.userId === 'alice')?.owedAmount).toBe(150);
    expect(splits.find((s) => s.userId === 'bob')?.owedAmount).toBe(100);
    expect(splits.find((s) => s.userId === 'charlie')?.owedAmount).toBe(50);
  });

  it('throws when amounts do not sum to total', () => {
    expect(() =>
      calculateSplit({
        type: 'EXACT',
        totalAmount: 300,
        participantIds: PARTICIPANTS,
        payerId: 'alice',
        exactAmounts: { alice: 100, bob: 100, charlie: 50 }, // sum = 250 ≠ 300
      }),
    ).toThrow();
  });
});

describe('calculateSplit — PERCENTAGE', () => {
  it('calculates correct amounts from percentages', () => {
    const { splits } = calculateSplit({
      type: 'PERCENTAGE',
      totalAmount: 200,
      participantIds: ['alice', 'bob'],
      payerId: 'alice',
      percentages: { alice: 75, bob: 25 },
    });
    expect(splits.find((s) => s.userId === 'alice')?.owedAmount).toBe(150);
    expect(splits.find((s) => s.userId === 'bob')?.owedAmount).toBe(50);
  });

  it('throws when percentages do not sum to 100', () => {
    expect(() =>
      calculateSplit({
        type: 'PERCENTAGE',
        totalAmount: 100,
        participantIds: ['alice', 'bob'],
        payerId: 'alice',
        percentages: { alice: 60, bob: 30 }, // sum = 90
      }),
    ).toThrow();
  });

  it('handles penny rounding so splits still sum to total', () => {
    // 3-way 33.33% each on ₹100 → one participant gets ₹33.34
    const { splits } = calculateSplit({
      type: 'PERCENTAGE',
      totalAmount: 100,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
      percentages: { alice: 33.33, bob: 33.33, charlie: 33.34 },
    });
    assertSplitsSumToTotal(splits, 100);
  });
});

describe('calculateSplit — SHARES', () => {
  it('allocates proportionally to share counts', () => {
    // alice:bob = 2:1 on ₹300
    const { splits } = calculateSplit({
      type: 'SHARES',
      totalAmount: 300,
      participantIds: ['alice', 'bob'],
      payerId: 'alice',
      shares: { alice: 2, bob: 1 },
    });
    expect(splits.find((s) => s.userId === 'alice')?.owedAmount).toBe(200);
    expect(splits.find((s) => s.userId === 'bob')?.owedAmount).toBe(100);
  });

  it('splits sum to total', () => {
    const { splits } = calculateSplit({
      type: 'SHARES',
      totalAmount: 100,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
      shares: { alice: 3, bob: 2, charlie: 1 },
    });
    assertSplitsSumToTotal(splits, 100);
  });

  it('throws when total shares is zero', () => {
    expect(() =>
      calculateSplit({
        type: 'SHARES',
        totalAmount: 100,
        participantIds: ['alice'],
        payerId: 'alice',
        shares: { alice: 0 },
      }),
    ).toThrow();
  });
});

describe('calculateSplit — ADJUSTMENT', () => {
  it('applies per-person adjustments on top of equal base', () => {
    // ₹300 split 3 ways (₹100 base) with alice +₹50, bob -₹50
    const { splits } = calculateSplit({
      type: 'ADJUSTMENT',
      totalAmount: 300,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
      adjustments: { alice: 50, bob: -50, charlie: 0 },
    });
    expect(splits.find((s) => s.userId === 'alice')?.owedAmount).toBe(150);
    expect(splits.find((s) => s.userId === 'bob')?.owedAmount).toBe(50);
    expect(splits.find((s) => s.userId === 'charlie')?.owedAmount).toBe(100);
  });

  it('splits still sum to total', () => {
    const { splits } = calculateSplit({
      type: 'ADJUSTMENT',
      totalAmount: 90,
      participantIds: ['alice', 'bob'],
      payerId: 'alice',
      adjustments: { alice: 10, bob: -10 },
    });
    assertSplitsSumToTotal(splits, 90);
  });
});

describe('calculateSplit — ITEMISED', () => {
  it('assigns line items to specified assignees', () => {
    const { splits } = calculateSplit({
      type: 'ITEMISED',
      totalAmount: 300,
      participantIds: PARTICIPANTS,
      payerId: 'alice',
      lineItems: [
        { name: 'Pizza', amount: 200, assignedUserIds: ['alice', 'bob'] },
        { name: 'Drinks', amount: 100, assignedUserIds: ['charlie'] },
      ],
    });
    expect(splits.find((s) => s.userId === 'alice')?.owedAmount).toBe(100);
    expect(splits.find((s) => s.userId === 'bob')?.owedAmount).toBe(100);
    expect(splits.find((s) => s.userId === 'charlie')?.owedAmount).toBe(100);
  });

  it('throws when line items do not sum to total', () => {
    expect(() =>
      calculateSplit({
        type: 'ITEMISED',
        totalAmount: 300,
        participantIds: PARTICIPANTS,
        payerId: 'alice',
        lineItems: [{ name: 'Pizza', amount: 200, assignedUserIds: ['alice'] }],
      }),
    ).toThrow();
  });
});

describe('validateSplitInput', () => {
  it('returns null for a valid EQUAL input', () => {
    expect(
      validateSplitInput({
        type: 'EQUAL',
        totalAmount: 100,
        participantIds: ['alice'],
        payerId: 'alice',
      }),
    ).toBeNull();
  });

  it('returns error when amount is 0', () => {
    expect(
      validateSplitInput({
        type: 'EQUAL',
        totalAmount: 0,
        participantIds: ['alice'],
        payerId: 'alice',
      }),
    ).not.toBeNull();
  });

  it('returns error when no participants', () => {
    expect(
      validateSplitInput({
        type: 'EQUAL',
        totalAmount: 100,
        participantIds: [],
        payerId: 'alice',
      }),
    ).not.toBeNull();
  });
});
