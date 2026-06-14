export type PriorityState = "TX" | "FL" | "OH" | "PA" | "NC" | "NY";

export type SearchParams = {
  drug: string;
  strength?: string;
  quantity: number;
  zip: string;
};

export type DrugSuggestion = {
  name: string;
  strengths?: string[];
};

export type Pharmacy = {
  id: string;
  name: string;
  addressLine?: string;
  city: string;
  state: PriorityState;
  zip: string;
  latitude?: number;
  longitude?: number;
  distanceMiles: number;
};

export type PriceRange = {
  low: number;
  high: number;
  currency: "USD";
};

export type PriceResult = {
  pharmacyId: string;
  drug: string;
  strength?: string;
  quantity: number;
  zip: string;
  priceRange: PriceRange;
  reservePrice: number; // “at this price” anchor
};

export type ReservationInput = {
  fullName: string;
  phone: string;
  email: string;
  rxUpload?: {
    fileName: string;
    mimeType: string;
    // not persisted in MVP
  } | null;
  notes?: string;
};

export type ReservationRecord = {
  id: string;
  createdAtISO: string;
  status: "pending" | "confirmed" | "declined";
  reservationInput: ReservationInput;
  priceResult: PriceResult;
};

