import { NextResponse } from "next/server";

function jsonError(message: string, extra?: any, status = 500) {
  return NextResponse.json(
    { error: message, ...(extra ? { details: extra } : {}) },
    { status }
  );
}

export async function GET(request: Request) {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    return jsonError("Missing CLASH_API_TOKEN in .env.local");
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since") || "2023-01-01";

  const url = `https://api.clash.gg/affiliates/detailed-summary/v2/${encodeURIComponent(
    since
  )}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Required per Clash instructions:
        Cookie: "let-me-in=top-secret-cookie-do-not-share",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      return jsonError(
        `Clash API failed (${res.status})`,
        { url, body: text },
        res.status
      );
    }

    // Pass through parsed JSON
    return NextResponse.json(JSON.parse(text));
  } catch (e: any) {
    return jsonError("Fetch crashed", { message: e?.message ?? String(e), url });
  }
}
