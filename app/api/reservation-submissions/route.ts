import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";

function getString(form: FormData, key: string) {
  const value = form.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function todayYYMMDD(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());

  return `${yy}${mm}${dd}`;
}

function reservationNumberFromParts(yyMMdd: string, sequence: number) {
  const suffix = String(sequence).padStart(6, "0");

  return `${yyMMdd}${suffix}`;
}

function createdIdForReservation(reservationNumber: string, pharmacyNpi: string) {
  return `r-${pharmacyNpi}-${reservationNumber}`;
}

function parseDeliveryAddress(raw: string) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const pharmacyNpi = getString(form, "npi").trim();
    const drug = getString(form, "drug").trim();
    const strength = getString(form, "strength").trim();
    const quantity = Math.max(1, Number(getString(form, "quantity") || "30"));
    const zip = getString(form, "zip").trim();

    const fulfillmentMethodRaw = getString(form, "fulfillmentMethod").trim();
    const allowedFulfillmentMethods = new Set(["pickup", "local_delivery"]);
    const fulfillmentMethod = fulfillmentMethodRaw || "pickup";

    const deliveryAddressRaw = getString(form, "deliveryAddress").trim();
    const deliveryAddress = parseDeliveryAddress(deliveryAddressRaw);

    const rxOnFile = getString(form, "rxOnFile").trim() === "true";
    const rxUploadAcknowledged =
      getString(form, "rxUploadAcknowledged").trim() === "true";

    const firstName = getString(form, "firstName").trim();
    const lastName = getString(form, "lastName").trim();
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || "Patient";

    const phone = getString(form, "phone").trim();
    const email = getString(form, "email").trim();
    const notes = getString(form, "notes").trim();

    const doctorName = getString(form, "doctorName").trim();
    const doctorCity = getString(form, "doctorCity").trim();
    const doctorState = getString(form, "doctorState").trim();
    const referralCode = getString(form, "referralCode").trim();

    if (!pharmacyNpi) {
      return NextResponse.json({ error: "Missing pharmacy npi" }, { status: 400 });
    }

    if (!drug) {
      return NextResponse.json({ error: "Missing drug" }, { status: 400 });
    }

    if (!strength) {
      return NextResponse.json({ error: "Missing strength" }, { status: 400 });
    }

    if (!allowedFulfillmentMethods.has(fulfillmentMethod)) {
      return NextResponse.json(
        { error: "Invalid fulfillmentMethod" },
        { status: 400 },
      );
    }

    const pharmacy = await db.pharmacy.upsert({
      where: { npi: pharmacyNpi },
      update: {},
      create: {
        id: `ph-${pharmacyNpi}`,
        npi: pharmacyNpi,
        name: "Unknown pharmacy",
        address1: "",
        address2: null,
        city: "",
        state: "TX",
        zip: "",
        phone: "",
        profileStatus: "unclaimed",
        pricingPublished: false,
        reservationsEnabled: true,
      },
      select: {
        npi: true,
        deliveryEnabled: true,
        deliveryRadiusMiles: true,
        deliveryFeeCents: true,
      },
    });

    if (fulfillmentMethod === "local_delivery") {
      if (!pharmacy.deliveryEnabled) {
        return NextResponse.json(
          { error: "Local delivery is not enabled for this pharmacy" },
          { status: 400 },
        );
      }

      if (
        pharmacy.deliveryRadiusMiles === null ||
        pharmacy.deliveryRadiusMiles === undefined
      ) {
        return NextResponse.json(
          { error: "deliveryRadiusMiles must be set for local delivery" },
          { status: 400 },
        );
      }

      if (pharmacy.deliveryRadiusMiles > 20) {
        return NextResponse.json(
          { error: "deliveryRadiusMiles must be 20 miles or less" },
          { status: 400 },
        );
      }

      if (!deliveryAddress) {
        return NextResponse.json(
          { error: "deliveryAddress is required for local delivery" },
          { status: 400 },
        );
      }
    }

    const activePrice = await db.drugPrice.findUnique({
      where: {
        pharmacyNpi_drugName_strength_quantity_status: {
          pharmacyNpi,
          drugName: drug,
          strength,
          quantity,
          status: "active",
        },
      },
      select: {
        id: true,
        drugName: true,
        strength: true,
        quantity: true,
        pharmacyNpi: true,
        cashPriceCents: true,
        productType: true,
      },
    });

    if (!activePrice) {
      return NextResponse.json(
        {
          error:
            "No active DrugPrice published for this reservation. CSV upload or wizard pricing is required.",
        },
        { status: 400 },
      );
    }

    const cashPriceCents = activePrice.cashPriceCents;
    const reservePrice = Math.round((cashPriceCents / 100) * 100) / 100;
    const productType = activePrice.productType;

    let prescriptionStatus: string;

    if (productType === "otc") {
      prescriptionStatus = "not_required";
    } else {
      if (!rxOnFile && !rxUploadAcknowledged) {
        return NextResponse.json(
          {
            error:
              "Prescription reservations require rxOnFile=true or rxUploadAcknowledged=true",
          },
          { status: 400 },
        );
      }

      prescriptionStatus = rxOnFile
        ? "on_file"
        : "required_pending_verification";
    }

    const rewardRateBps = 100;
    const rewardPointsEstimated = Math.floor(
      (cashPriceCents * rewardRateBps) / 10000,
    );
    const rewardStatus = "pending";

    const yyMMdd = todayYYMMDD();

    const counter = await db.reservationCounter.findUnique({
      where: { yyMMdd },
      select: { nextNumber: true },
    });

    const nextNumber = counter?.nextNumber ?? 1;
    const reservationNumber = reservationNumberFromParts(yyMMdd, nextNumber);

    const deliveryAddressFinal =
      fulfillmentMethod === "local_delivery" ? deliveryAddress : null;

    const deliveryFeeCentsFinal =
      fulfillmentMethod === "local_delivery"
        ? pharmacy.deliveryFeeCents ?? 0
        : null;

    let doctorReferralId: string | null = null;
    const shouldCreateDoctorReferral = Boolean(doctorName || referralCode);

    if (shouldCreateDoctorReferral) {
      const safeDoctorName = doctorName || "Unknown Doctor";
      const safeCity = doctorCity || "";
      const safeState = doctorState || "";
      const safeReferralCode = referralCode || `REF_${pharmacyNpi}_${Date.now()}`;

      const doctorReferral = await db.doctorReferral.create({
        data: {
          id: `dr-${safeReferralCode}`,
          doctorName: safeDoctorName,
          city: safeCity,
          state: safeState,
          referralCode: safeReferralCode,
        },
        select: { id: true },
      });

      doctorReferralId = doctorReferral.id;
    }

    const created = await db.reservation.create({
      data: {
        id: createdIdForReservation(reservationNumber, pharmacyNpi),
        reservationNumber,
        status: "pending",
        reservationFeeCents: 500,
        reservationFeeStatus: "waived",

        pharmacyNpi,

        fulfillmentMethod,
        deliveryAddress: deliveryAddressFinal,
        deliveryFeeCents: deliveryFeeCentsFinal,

        rewardRateBps,
        rewardPointsEstimated,
        rewardStatus,

        prescriptionStatus,

        reservationInput: {
          fullName,
          phone,
          email: email || null,
          rxUpload: null,
          notes: notes || null,
          strength,
          quantity,
          zip,
          drug,
          rxOnFile,
          rxUploadAcknowledged,
          doctorReferralId,
          doctorName: doctorName || null,
          referralCode: referralCode || null,
        },

        priceResult: {
          drugPriceId: activePrice.id,
          drugName: activePrice.drugName,
          strength: activePrice.strength,
          quantity: activePrice.quantity,
          cashPriceCents,
          pharmacyNpi: activePrice.pharmacyNpi,
          priceSource: "pharmacy_submitted",
          productType,

          reservePrice,
          currency: "USD",
          priceLow: reservePrice,
          priceHigh: reservePrice,
          drug,
          zip,
        },
      },
      select: {
        id: true,
        reservationNumber: true,
      },
    });

    await db.reservationCounter.upsert({
      where: { yyMMdd },
      update: { nextNumber: nextNumber + 1 },
      create: {
        id: yyMMdd,
        yyMMdd,
        nextNumber: nextNumber + 1,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/reservation/confirmation?reservationId=${encodeURIComponent(
          created.id,
        )}&reservationNumber=${encodeURIComponent(
          created.reservationNumber,
        )}&npi=${encodeURIComponent(pharmacyNpi)}`,
        req.url,
      ),
      303,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}