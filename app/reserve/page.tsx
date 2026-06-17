import { IPNNav } from "../lib/ipn-nav";
import { PHARMACIES, computePriceResult } from "../lib/ipn-mock-data";
import Link from "next/link";

function readQuery(searchParams: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") sp.set(k, v);
  }
  return sp;
}

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sp = readQuery(params);




  const pharmacyId = sp.get("pharmacyId") ?? "";
  const drug = sp.get("drug") ?? "";
  const strength = sp.get("strength") ?? undefined;
  const quantity = Math.max(1, Number(sp.get("quantity") ?? 30));
  const zip = sp.get("zip") ?? "";

  const pharmacy = PHARMACIES.find((p) => p.id === pharmacyId) ?? PHARMACIES[0];

  const priceResult = computePriceResult({
    drug,
    strength: strength || undefined,
    quantity,
    zip: zip || pharmacy.zip,
    pharmacy,
  });

  // In this MVP, we POST the reservation request to the DB-backed route.
  const action = "/api/reservation-submissions";

  const npi = pharmacy.id.replace(/^ph-/, "");

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Reservation</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
            Reserve at{" "}
            <span className="text-emerald-700">
              {priceResult.priceRange.currency} {priceResult.reservePrice}
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            {pharmacy.name} • {pharmacy.city}, {pharmacy.state}
          </p>
          <p className="text-sm text-emerald-800 mt-3 font-medium">
            Earn 1% back in pending IPNUS points after the pharmacy completes the reservation.
          </p>
        </div>

        <form
          method="post"
          action={action}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="npi" value={npi} />
          <input type="hidden" name="pharmacyNpi" value={npi} />

          <input type="hidden" name="drug" value={priceResult.drug} />
          <input type="hidden" name="strength" value={priceResult.strength ?? ""} />
          <input type="hidden" name="quantity" value={String(priceResult.quantity)} />
          <input type="hidden" name="zip" value={priceResult.zip} />

          <input type="hidden" name="reservePrice" value={String(priceResult.reservePrice)} />
          <input type="hidden" name="priceLow" value={String(priceResult.priceRange.low)} />
          <input type="hidden" name="priceHigh" value={String(priceResult.priceRange.high)} />

          {/* Required by reservation API */}
          <input type="hidden" name="fulfillmentMethod" value="pickup" />
          <input type="hidden" name="deliveryAddress" value="" />
          <input type="hidden" name="doctorName" value="" />
          <input type="hidden" name="referralCode" value="" />
          <input type="hidden" name="rxOnFile" value="false" />
          <input type="hidden" name="rxUploadAcknowledged" value="false" />

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">First name</label>
                <input
                  name="firstName"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Last name</label>
                <input
                  name="lastName"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Phone number</label>
              <input
                name="phone"
                type="tel"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">How would you like to fulfill?</div>
              <div className="mt-3 flex gap-3 flex-col sm:flex-row">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="radio" name="fulfillmentPicker" defaultChecked value="pickup" />
                  Pickup
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="radio" name="fulfillmentPicker" value="local_delivery" />
                  Local Delivery
                </label>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Delivery address</div>
                  <p className="text-xs text-gray-500 mt-1">Shown only for Local Delivery.</p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900">Street / address line</label>
                      <input
                        name="deliveryLine"
                        className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="123 Main St"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">City</label>
                      <input
                        name="deliveryCity"
                        className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="Austin"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">State</label>
                      <input
                        name="deliveryState"
                        className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="TX"
                        disabled
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900">ZIP</label>
                      <input
                        name="deliveryZip"
                        className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="78701"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription section */}
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">Prescription</div>
              <div className="mt-2 text-sm text-gray-600">
                If this medication requires a prescription, we need you to confirm.
              </div>

              <div className="mt-4 grid gap-3">
                <label className="flex items-start gap-3 text-sm text-gray-800">
                  <input type="checkbox" name="rxOnFilePicker" />
                  <span>
                    <span className="font-medium">Prescription on file at this pharmacy</span>
                    <span className="block text-xs text-gray-500">Marks rxOnFile=true for the reservation.</span>
                  </span>
                </label>

                <div className="text-sm text-gray-600">
                  <div className="font-semibold text-gray-900">Upload prescription (optional)</div>
                  <div className="mt-1">Upload an image or PDF. The pharmacy can review it before fulfillment.</div>
                  <input
                    name="rxUpload"
                    type="file"
                    accept="image/*,application/pdf"
                    className="mt-3 w-full"
                  />

                  <p className="mt-3 text-xs text-gray-700">
                    Don’t know the medication details? Upload your prescription and the pharmacy can review it.
                  </p>
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-800">
                  <input type="checkbox" name="rxUploadAckPicker" />
                  <span>
                    <span className="font-medium">
                      I acknowledge the pharmacy must verify this prescription before fulfillment
                    </span>
                    <span className="block text-xs text-gray-500">Marks rxUploadAcknowledged=true for the reservation.</span>
                  </span>
                </label>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                You must satisfy the prescription requirements for your selected medication before the pharmacy can confirm.
              </div>
            </div>

            {/* Doctor referral */}
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">Referral</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Referral code (optional)</label>
                  <input
                    name="referralCodePicker"
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g., AB12CD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Doctor name (optional)</label>
                  <input
                    name="doctorNamePicker"
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Dr. Smith"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Notes to pharmacy (optional)</label>
              <textarea
                name="notes"
                rows={3}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Submit Reservation Request
            </button>

            <div className="text-xs text-gray-500">
              By submitting, you agree we can contact you to confirm availability.
            </div>

            <div>
              <Link
                href="/results"
                className="text-sm text-emerald-700 hover:text-emerald-800 underline"
              >
                Back to results
              </Link>
            </div>

            {/* Bridge pickers to actual API fields */}
            <script
              
              dangerouslySetInnerHTML={{
                __html: `
(function(){
  const form = document.currentScript?.closest('form');
  if(!form) return;

  const fulfillmentPicker = form.querySelector('input[name="fulfillmentPicker"]:checked');
  const fulfillmentMethodHidden = form.querySelector('input[name="fulfillmentMethod"]');
  const deliveryAddressHidden = form.querySelector('input[name="deliveryAddress"]');

  const deliveryInputs = {
    line: form.querySelector('input[name="deliveryLine"]'),
    city: form.querySelector('input[name="deliveryCity"]'),
    state: form.querySelector('input[name="deliveryState"]'),
    zip: form.querySelector('input[name="deliveryZip"]'),
  };

  function setDeliveryEnabled(enabled){
    Object.values(deliveryInputs).forEach((el)=>{ if(el) el.disabled = !enabled; });
  }

  function syncFulfillment(){
    const selected = form.querySelector('input[name="fulfillmentPicker"]:checked');
    const val = selected ? selected.value : 'pickup';
    if(fulfillmentMethodHidden) fulfillmentMethodHidden.value = val;
    if(deliveryAddressHidden) deliveryAddressHidden.value = '';

    if(val === 'local_delivery'){
      setDeliveryEnabled(true);
      // Serialize on submit (validated by reservation API presence check)
      const payload = {
        line: deliveryInputs.line?.value || '',
        city: deliveryInputs.city?.value || '',
        state: deliveryInputs.state?.value || '',
        zip: deliveryInputs.zip?.value || '',
      };
      if(payload.line && payload.city && payload.state && payload.zip){
        deliveryAddressHidden.value = JSON.stringify(payload);
      }
    }else{
      setDeliveryEnabled(false);
    }
  }

  // Rx pickers
  const rxOnFileHidden = form.querySelector('input[name="rxOnFile"]');
  const rxUploadAckHidden = form.querySelector('input[name="rxUploadAcknowledged"]');
  const rxOnFilePicker = form.querySelector('input[name="rxOnFilePicker"]');
  const rxUploadAckPicker = form.querySelector('input[name="rxUploadAckPicker"]');

  function syncRx(){
    if(rxOnFileHidden) rxOnFileHidden.value = rxOnFilePicker && rxOnFilePicker.checked ? 'true' : 'false';
    if(rxUploadAckHidden) rxUploadAckHidden.value = rxUploadAckPicker && rxUploadAckPicker.checked ? 'true' : 'false';
  }

  // Doctor/referral pickers
  const doctorNameHidden = form.querySelector('input[name="doctorName"]');
  const referralCodeHidden = form.querySelector('input[name="referralCode"]');
  const doctorNamePicker = form.querySelector('input[name="doctorNamePicker"]');
  const referralCodePicker = form.querySelector('input[name="referralCodePicker"]');

  function syncReferral(){
    if(doctorNameHidden) doctorNameHidden.value = doctorNamePicker?.value || '';
    if(referralCodeHidden) referralCodeHidden.value = referralCodePicker?.value || '';
  }

  // Wire up events
  form.querySelectorAll('input[name="fulfillmentPicker"]').forEach((el)=>{
    el.addEventListener('change', ()=>{ syncFulfillment(); });
  });
  if(rxOnFilePicker) rxOnFilePicker.addEventListener('change', syncRx);
  if(rxUploadAckPicker) rxUploadAckPicker.addEventListener('change', syncRx);
  if(doctorNamePicker) doctorNamePicker.addEventListener('input', syncReferral);
  if(referralCodePicker) referralCodePicker.addEventListener('input', syncReferral);

  form.addEventListener('submit', (e)=>{
    syncFulfillment();
    syncRx();
    syncReferral();
  });

  // initial
  syncFulfillment();
  syncRx();
  syncReferral();
})();
`}} />
          </div>
        </form>
      </div>
    </div>
  );
}


