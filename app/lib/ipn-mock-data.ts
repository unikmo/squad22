import type { DrugSuggestion, Pharmacy, PriorityState, PriceRange, PriceResult, ReservationRecord } from "./ipn-types";

export const PRIORITY_STATES: PriorityState[] = ["TX", "FL", "OH", "PA", "NC", "NY"];

import { IPN_TOP300_DRUGS } from "./ipn-drugs-top300";

// MVP autocomplete uses the seeded Top-300 canonical generics.
const DRUGS: DrugSuggestion[] = IPN_TOP300_DRUGS.map((d) => ({ name: d.canonicalGenericName }));

export function getTopDrugSuggestions(): DrugSuggestion[] {
  return DRUGS;
}



// Mock directory
export const PHARMACIES: Pharmacy[] = [
  {
    id: "ph-tx-1",
    name: "Independence Care Pharmacy",
    addressLine: "101 Main St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    distanceMiles: 2.4,
  },
  {
    id: "ph-tx-2",
    name: "Lone Star Family Pharmacy",
    addressLine: "220 W 2nd St",
    city: "Austin",
    state: "TX",
    zip: "78702",
    distanceMiles: 5.8,
  },
  {
    id: "ph-fl-1",
    name: "Sun Coast Independent Pharmacy",
    addressLine: "55 Harbor Ave",
    city: "Tampa",
    state: "FL",
    zip: "33602",
    distanceMiles: 1.9,
  },
  {
    id: "ph-fl-2",
    name: "Citrus Grove Pharmacy",
    addressLine: "901 Orange Blvd",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    distanceMiles: 6.6,
  },
  {
    id: "ph-oh-1",
    name: "Ohio Valley Community Pharmacy",
    addressLine: "12 Market St",
    city: "Columbus",
    state: "OH",
    zip: "43215",
    distanceMiles: 3.3,
  },
  {
    id: "ph-pa-1",
    name: "Keystone Health Pharmacy",
    addressLine: "77 Liberty Dr",
    city: "Philadelphia",
    state: "PA",
    zip: "19103",
    distanceMiles: 4.5,
  },
  {
    id: "ph-nc-1",
    name: "Carolina Corner Pharmacy",
    addressLine: "8 Elm St",
    city: "Raleigh",
    state: "NC",
    zip: "27601",
    distanceMiles: 2.8,
  },
  {
    id: "ph-ny-1",
    name: "Empire Independent Pharmacy",
    addressLine: "44 Madison Ave",
    city: "New York",
    state: "NY",
    zip: "10010",
    distanceMiles: 4.1,
  },
];

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function computePriceRange(args: {
  drug: string;
  strength?: string;
  quantity: number;
  zip: string;
  pharmacyId: string;
}): PriceRange {
  const { drug, strength, quantity, zip, pharmacyId } = args;

  const base = stableHash(`${drug}|${strength ?? ""}|${zip}`) % 900; // 0..899
  const pharmacyFactor = 0.85 + (stableHash(pharmacyId) % 30) / 100; // 0.85..1.14
  const qtyFactor = 0.55 + Math.min(3, Math.max(0.5, quantity / 30)) * 0.35; // tame

  const low = Math.round((base + 25) * pharmacyFactor * qtyFactor * 0.75);
  const high = Math.round(low * (1.08 + ((stableHash(drug + zip) % 10) / 100))); // ~8-17% spread
  return { low: Math.max(8, low), high: Math.max(12, high), currency: "USD" };
}

export function computePriceResult(args: {
  drug: string;
  strength?: string;
  quantity: number;
  zip: string;
  pharmacy: Pharmacy;
}): PriceResult {
  const priceRange = computePriceRange({
    drug: args.drug,
    strength: args.strength,
    quantity: args.quantity,
    zip: args.zip,
    pharmacyId: args.pharmacy.id,
  });

  // Anchor reserve price typically nearer the lower bound.
  const reservePrice = Math.round(priceRange.low * 1.03);

  return {
    pharmacyId: args.pharmacy.id,
    drug: args.drug,
    strength: args.strength,
    quantity: args.quantity,
    zip: args.zip,
    priceRange,
    reservePrice,
  };
}

// Mock in-memory reservation store (module-level)
const reservations: ReservationRecord[] = [];

export function createReservation(record: Omit<ReservationRecord, "id" | "createdAtISO">): ReservationRecord {
  const id = `res_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  const createdAtISO = new Date().toISOString();
  const full: ReservationRecord = { ...record, id, createdAtISO };
  reservations.unshift(full);
  return full;
}

export function listReservations(): ReservationRecord[] {
  return [...reservations];
}

export function updateReservationStatus(id: string, status: ReservationRecord["status"]): ReservationRecord | null {
  const idx = reservations.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  reservations[idx] = { ...reservations[idx], status };
  return reservations[idx];
}

export function findReservationById(id: string): ReservationRecord | null {
  return reservations.find((r) => r.id === id) ?? null;
}

