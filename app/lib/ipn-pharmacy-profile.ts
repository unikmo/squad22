export type PharmacyProfileTier = "claimed" | "unclaimed";


export type PharmacyProfile = {
  pharmacyId: string;
  tier: PharmacyProfileTier;
  respondsWithinHours?: number;
};

export const PHARMACY_PROFILES: PharmacyProfile[] = [
  {
    pharmacyId: "ph-tx-1",
    tier: "claimed",
    respondsWithinHours: 2,
  },
  {
    pharmacyId: "ph-tx-2",
    tier: "unclaimed",
  },
  {
    pharmacyId: "ph-fl-1",
    tier: "claimed",
    respondsWithinHours: 2,
  },
  {
    pharmacyId: "ph-fl-2",
    tier: "unclaimed",
  },
  {
    pharmacyId: "ph-oh-1",
    tier: "claimed",
    respondsWithinHours: 3,
  },
  {
    pharmacyId: "ph-pa-1",
    tier: "unclaimed",
  },
  {
    pharmacyId: "ph-nc-1",
    tier: "claimed",
    respondsWithinHours: 2,
  },
  // NY placeholder (if/when we add an NY pharmacy entry)
  {
    pharmacyId: "ph-ny-1",
    tier: "claimed",
    respondsWithinHours: 2,
  },
];

export function getPharmacyProfile(pharmacyId: string): PharmacyProfile {
  return PHARMACY_PROFILES.find((p) => p.pharmacyId === pharmacyId) ?? { pharmacyId, tier: "unclaimed" };
}

