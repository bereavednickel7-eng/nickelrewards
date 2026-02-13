import { NextResponse } from "next/server";

function jsonError(message: string, extra?: any, status = 500) {
  return NextResponse.json(
    { error: message, ...(extra ? { details: extra } : {}) },
    { status }
  );
}

export async function GET(request: Request) {
  const token = process.env.CASES_API_TOKEN;

  if (!token) {
    return jsonError("Missing CASES_API_TOKEN in .env.local");
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since") || "2023-01-01";

  const url = `https://api.cases.gg/affiliates/detailed-summary/v2/${encodeURIComponent(
    since
  )}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    // If they block/whitelist fails, this will be HTML.
    if (!res.ok) {
      return jsonError(
        `Cases API failed (${res.status})`,
        { url, body: text.slice(0, 2000) }, // don’t spam your screen with 50k chars
        res.status
      );
    }

    // Parse safely
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return jsonError("Cases API returned non-JSON", { url, body: text.slice(0, 2000) }, 500);
    }
  } catch (e: any) {
    return jsonError("Fetch crashed", { message: e?.message ?? String(e), url });
  }
}
