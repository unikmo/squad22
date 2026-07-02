import { NextResponse } from "next/server";

// MVP OCR endpoint (stub).
// - Accepts multipart/form-data with a single file field named: `prescription`
// - Returns extracted fields that the UI can use to auto-fill.
//
// Note: This is intentionally a stub (no external OCR integration yet).
// Replace the extraction logic with your OCR provider of choice.

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("prescription");

    // Basic validation: must be a File
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing prescription file" }, { status: 400 });
    }

    // Stub extraction: return empty values.
    // UI will keep whatever user already entered.
    return NextResponse.json({
      drug: null,
      strength: null,
      quantity: null,
      // Include some debug info
      file: {
        filename: file.name,
        contentType: file.type,
        size: file.size,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

