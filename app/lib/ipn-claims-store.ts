import type { PharmacyClaimStatus, PharmacyClaimProfile } from "./ipn-claims-types";


// MVP in-memory store keyed by NPI.
// In production this would be persisted.
const profiles: Record<string, PharmacyClaimProfile> = {
  // TX
  "1111111111": {
    npi: "1111111111",
    pharmacyName: "Independence Care Pharmacy",
    address1: "101 Main St",
    address2: "",
    city: "Austin",
    state: "TX",
    zip: "78701",
    phone: "(512) 555-0100",
    profileStatus: "claimed",
    pricingPublished: true,
    reservationsEnabled: true,
  },
  "1111111112": {
    npi: "1111111112",
    pharmacyName: "Lone Star Family Pharmacy",
    address1: "220 W 2nd St",
    address2: "",
    city: "Austin",
    state: "TX",
    zip: "78702",
    phone: "(512) 555-0101",
    profileStatus: "unclaimed",
    pricingPublished: false,
    reservationsEnabled: false,
  },

  // FL
  "2222222221": {
    npi: "2222222221",
    pharmacyName: "Sun Coast Independent Pharmacy",
    address1: "55 Harbor Ave",
    address2: "",
    city: "Tampa",
    state: "FL",
    zip: "33602",
    phone: "(813) 555-0100",
    profileStatus: "claimed",
    pricingPublished: true,
    reservationsEnabled: true,
  },
  "2222222222": {
    npi: "2222222222",
    pharmacyName: "Citrus Grove Pharmacy",
    address1: "901 Orange Blvd",
    address2: "",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    phone: "(407) 555-0100",
    profileStatus: "unclaimed",
    pricingPublished: false,
    reservationsEnabled: false,
  },

  // OH
  "3333333331": {
    npi: "3333333331",
    pharmacyName: "Ohio Valley Community Pharmacy",
    address1: "12 Market St",
    address2: "",
    city: "Columbus",
    state: "OH",
    zip: "43215",
    phone: "(614) 555-0100",
    profileStatus: "claimed",
    pricingPublished: true,
    reservationsEnabled: true,
  },

  // PA
  "4444444441": {
    npi: "4444444441",
    pharmacyName: "Keystone Health Pharmacy",
    address1: "77 Liberty Dr",
    address2: "",
    city: "Philadelphia",
    state: "PA",
    zip: "19103",
    phone: "(215) 555-0100",
    profileStatus: "unclaimed",
    pricingPublished: false,
    reservationsEnabled: false,
  },

  // NC
  "5555555551": {
    npi: "5555555551",
    pharmacyName: "Carolina Corner Pharmacy",
    address1: "8 Elm St",
    address2: "",
    city: "Raleigh",
    state: "NC",
    zip: "27601",
    phone: "(919) 555-0100",
    profileStatus: "claimed",
    pricingPublished: true,
    reservationsEnabled: true,
  },

  // NY
  "6666666661": {
    npi: "6666666661",
    pharmacyName: "Empire Independent Pharmacy",
    address1: "44 Madison Ave",
    address2: "",
    city: "New York",
    state: "NY",
    zip: "10010",
    phone: "(212) 555-0100",
    profileStatus: "claimed",
    pricingPublished: true,
    reservationsEnabled: true,
  },
};

export function getPharmacyClaimProfile(npi: string): PharmacyClaimProfile {
  return (
    profiles[npi] ?? {
      npi,
      pharmacyName: "Unknown pharmacy",
      address1: "",
      address2: "",
      city: "",
      state: "TX",
      zip: "",
      phone: "",
      profileStatus: "unclaimed",
      pricingPublished: false,
      reservationsEnabled: false,
    }
  );
}

export function requestClaim(npi: string): { status: PharmacyClaimStatus } {
  const existing = profiles[npi];
  if (existing) {
    // Keep whatever status; for MVP we don't transition until verification.
    return { status: existing.profileStatus };
  }

  profiles[npi] = {
    npi,
    pharmacyName: "Unknown pharmacy",
    address1: "",
    address2: "",
    city: "",
    state: "TX",
    zip: "",
    phone: "",
    profileStatus: "unclaimed",
    pricingPublished: false,
    reservationsEnabled: false,
  };

  return { status: "unclaimed" };
}

