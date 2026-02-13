import { NextResponse } from "next/server";

const ROOBET_URL = "https://roobetconnect.com/affiliate/v2/stats";

export async function GET() {
  try {
    // ✅ API key from .env.local
    const apiKey = process.env.ROOBET_API_KEY;

    // ✅ Hardcoded user ID (temporary)
    const userId = "8a58f75b-71f1-47e1-a2d8-00e4a61fd1c4";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ROOBET_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    // 📅 First day of current month (UTC)
    const startDate = new Date();
    startDate.setUTCDate(1);
    startDate.setUTCHours(0, 0, 0, 0);

    const url = `${ROOBET_URL}?userId=${userId}&startDate=${startDate.toISOString()}&sortBy=wagered`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Roobet API failed (${res.status})`,
          body: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
