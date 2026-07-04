export const POINTS_PER_DOLLAR = 1;
export const REDEMPTION_INCREMENT_POINTS = 100;
export const REDEMPTION_CENTS_PER_100_POINTS = 100;

export function calculateEarnedPoints(eligibleSpendCents: number) {
  if (!Number.isFinite(eligibleSpendCents) || eligibleSpendCents < 0) throw new Error("Eligible spend must be a non-negative number");
  return Math.round(eligibleSpendCents / 100) * POINTS_PER_DOLLAR;
}

export function calculatePharmacyFundingCents(eligibleSpendCents: number) {
  return calculateEarnedPoints(eligibleSpendCents);
}

export function calculateRedemptionCents(points: number) {
  if (!Number.isInteger(points) || points < 0 || points % REDEMPTION_INCREMENT_POINTS !== 0) throw new Error("Points must be redeemed in increments of 100");
  return (points / REDEMPTION_INCREMENT_POINTS) * REDEMPTION_CENTS_PER_100_POINTS;
}
