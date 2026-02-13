import Image from "next/image";
import Countdown from "../roobet/Countdown";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

// Most recent Sunday 00:00:00 UTC -> YYYY-MM-DD
function mostRecentSundayUTCDateString() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  start.setUTCDate(start.getUTCDate() - day);
  return start.toISOString().slice(0, 10);
}

function pickUsername(r: any): string {
  return (
    r?.username ??
    r?.userName ??
    r?.name ??
    r?.user ??
    r?.user?.username ??
    r?.user?.name ??
    "—"
  );
}

function pickWageredCents(r: any): number {
  const v =
    r?.wageredCents ??
    r?.wagered_cent ??
    r?.wagered_cents ??
    r?.wagered ??
    r?.totalWagered ??
    r?.amount ??
    r?.amountCents ??
    r?.wageredAmountCents ??
    r?.wageredAmount ??
    0;

  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num : 0;
}

export default async function CasesPage() {
  const sinceDate = mostRecentSundayUTCDateString();

  // Timer for the page: start at 2026-02-09 (UTC) and end 7 days later
  const timerStartIso = new Date(Date.UTC(2026, 1, 9, 0, 0, 0)).toISOString();
  const timerEndIso = new Date(Date.UTC(2026, 1, 16, 0, 0, 0)).toISOString();

  // Call your local API route
  const localUrl = `http://localhost:3000/api/cases?since=${sinceDate}`;

  let raw: any = null;
  let apiError: any = null;

  try {
    const res = await fetch(localUrl, { cache: "no-store" });
    const text = await res.text();

    if (!res.ok) {
      apiError = { error: `Local /api/cases failed (${res.status})`, body: text };
    } else {
      raw = JSON.parse(text);
    }
  } catch (e: any) {
    apiError = { error: "Failed to load /api/cases", message: e?.message ?? String(e), url: localUrl };
  }

  if (apiError) {
    return (
      <main className="min-h-screen text-black p-10">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/cases-logo.png" alt="Cases" width={120} height={40} />
          <h1 className="text-3xl font-bold">Cases Leaderboard</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-rose-300">
          <div className="font-semibold mb-2">API error</div>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(apiError, null, 2)}</pre>
        </div>
      </main>
    );
  }

  // Accept possible response shapes
  const rowsRaw: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.rows)
      ? raw.rows
      : Array.isArray(raw?.data?.rows)
        ? raw.data.rows
        : Array.isArray(raw?.details?.rows)
          ? raw.details.rows
          : [];

  const sinceLabel = raw?.since ?? sinceDate;

  const normalized = rowsRaw.map((r, idx) => {
    const username = pickUsername(r);
    const wageredCents = pickWageredCents(r);

    return {
      key: r?.uid ?? r?.id ?? `${username}-${idx}`,
      username,
      wagered: wageredCents / 100, // cents -> dollars (or "gem" dollars)
      raw: r,
    };
  });

  const sorted = [...normalized].sort((a, b) => b.wagered - a.wagered);
  const top10 = sorted.slice(0, 15);

  return (
    <main className="min-h-screen text-black p-10">
      <div className="flex items-center gap-3 mb-2">
        <Image src="/cases-logo.png" alt="Cases" width={120} height={40} />
        <h1 className="text-3xl font-bold">Cases Leaderboard</h1>
      </div>

      <div className="text-sm text-gray-700 mb-6">
        Ranked by <b>wagered</b> since <b>{sinceLabel}</b> (UTC).
      </div>
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 w-56">
          <div className="text-xs uppercase text-gray-600 tracking-wide">Prize Pool</div>
          <div className="text-lg font-bold">$800.00</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 w-56">
          <div className="text-xs uppercase text-gray-600 tracking-wide">Ends In</div>
          <div className="text-lg font-bold">
            <Countdown endIsoUtc={timerEndIso} />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Ends at <b>{timerEndIso.slice(0, 10)}</b> (UTC)
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-4 font-semibold border-b bg-gray-100 p-4">
          <div>Rank</div>
          <div>User</div>
          <div>Wagered</div>
          <div>Reward</div>
        </div>

        {top10.map((u, idx) => (
          <div key={u.key} className="grid grid-cols-4 p-4 border-t border-rose-200">
            <div>#{idx + 1}</div>
            <div>{u.username}</div>
            <div>{formatCurrency(u.wagered)}</div>
            <div className="font-semibold">{formatCurrency(0)}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
