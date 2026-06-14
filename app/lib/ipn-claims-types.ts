export type PharmacyClaimProfile = {
  npi: string;
  pharmacyName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  profileStatus: "claimed" | "unclaimed";
  pricingPublished: boolean;
  reservationsEnabled: boolean;
};

export type PharmacyClaimStatus = PharmacyClaimProfile["profileStatus"]; 

