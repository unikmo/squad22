import { strict as assert } from "node:assert";
import { calculateEarnedPoints, calculatePharmacyFundingCents, calculateRedemptionCents } from "../app/lib/ipn-rewards";

assert.equal(calculateEarnedPoints(3872), 39);
assert.equal(calculateEarnedPoints(5000), 50);
assert.equal(calculateEarnedPoints(10000), 100);
assert.equal(calculatePharmacyFundingCents(10000), 100);
assert.equal(calculateRedemptionCents(100), 100);
assert.equal(calculateRedemptionCents(2300), 2300);
assert.throws(() => calculateRedemptionCents(50));
console.log("IP REWARDS SMOKE TEST: PASS");
