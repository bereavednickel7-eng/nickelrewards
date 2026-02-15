function maskUsername(name: string) {
    if (!name || name.length < 4) return name;
    return name.slice(0, 2) + '***' + name.slice(-2);
  }
import Image from "next/image";
import Countdown from "../roobet/Countdown";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

// Most recent Monday 00:00:00 UTC -> YYYY-MM-DD
function mostRecentMondayUTCDateString() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const offset = (day + 6) % 7; // days to subtract to get back to Monday
  start.setUTCDate(start.getUTCDate() - offset);
  return start.toISOString().slice(0, 10);
}

// Try to extract username from various shapes
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

// Clash notes say "gem cents" (100 = 1 gem). Your sample: wageredCents.
// Some APIs might use wagered instead. Support both.
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

export default async function ClashPage() {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    return (
      <main className="min-h-screen text-black p-10">
        <h1 className="text-3xl font-bold mb-4">Clash Leaderboard</h1>
        <div className="bg-white rounded-xl shadow p-4 border border-rose-300">
          <div className="font-semibold mb-2">API error</div>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify({ error: "Missing CLASH_API_TOKEN in .env.local" }, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  const sinceDate = mostRecentMondayUTCDateString();  

  // Timer for the page: start at 2026-02-09 (UTC) and end 7 days later
  const timerStartIso = new Date(Date.UTC(2026, 1, 9, 0, 0, 0)).toISOString();
  const timerEndIso = new Date(Date.UTC(2026, 1, 16, 0, 0, 0)).toISOString();
  const url = `https://api.clash.gg/affiliates/detailed-summary/v2/${sinceDate}`;

  let raw: any = null;
  let apiError: any = null;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: "let-me-in=top-secret-cookie-do-not-share",
        Accept: "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      apiError = { error: `Clash API failed (${res.status})`, body: text, url };
    } else {
      raw = JSON.parse(text);
    }
  } catch (e: any) {
    apiError = { error: "Fetch crashed", message: e?.message ?? String(e), url };
  }

  if (apiError) {
    return (
      <main className="min-h-screen text-black p-10">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/clash-logo.png" alt="Clash" width={120} height={40} />
          <h1 className="text-3xl font-bold">Clash Leaderboard</h1>
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
        : [];

  const sinceLabel = raw?.since ?? sinceDate;

  // Normalize rows
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

  // Sort by wagered desc
  const sorted = [...normalized].sort((a, b) => b.wagered - a.wagered);
  // Show all users with at least 1 ticket
  const leaderboardRows = sorted.filter(u => Math.floor(u.wagered / 100) >= 1);
  const totalTickets = leaderboardRows.reduce((sum, u) => sum + Math.floor(u.wagered / 100), 0);
  const rewards = [1600, 675, 325, 150, 100, 100, 50, 50, 50, 50, 20, 20, 20, 20, 20];

  // Show debug if things look wrong (your exact issue)
  const looksBroken =
    rowsRaw.length > 0 &&
    leaderboardRows.length > 0 &&
    leaderboardRows.every((r) => r.username === "-") &&
    leaderboardRows.every((r) => r.wagered === 0);

  return (
    <main className="min-h-screen text-black p-10">
      <div className="flex items-center gap-3 mb-2">
        <Image src="/clash-logo.png" alt="Clash" width={120} height={40} />
        <h1 className="text-3xl font-bold">Clash Leaderboard</h1>
      </div>

      <div className="text-sm text-gray-700 mb-6">
        Ranked by <b>wagered</b> since <b>{sinceLabel}</b> (UTC).
      </div>

          <div className="flex gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4 w-56">
              <div className="text-xs uppercase text-gray-600 tracking-wide">Prize Pool</div>
              <div className="text-lg font-bold">$3,250.00</div>
              <div className="text-xs text-gray-600 mt-1">Rewards Are Paid Instantly</div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 w-56">
              <div className="text-xs uppercase text-gray-600 tracking-wide">Raffle</div>
              <div className="text-lg font-bold">$1,000 | {totalTickets} tickets</div>
              <div className="text-xs text-gray-600 mt-1">$100 Wagered = 1 Ticket</div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 w-56">
              <div className="text-xs uppercase text-gray-600 tracking-wide">Ends In</div>
              <div className="text-lg font-bold">
                <Countdown endIsoUtc={timerEndIso} repeatDays={7} />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Ends at <b>{timerEndIso.slice(0, 10)}</b> (UTC)
              </div>
            </div>
          </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-5 font-semibold border-b bg-gray-100 p-4">
          <div>Rank</div>
          <div>User</div>
          <div>Wagered</div>
          <div>Reward</div>
          <div>Raffle tickets</div>
        </div>

        {leaderboardRows.slice(0, 15).map((u, idx) => {
          const reward = rewards[idx] ?? 0;
          const tickets = Math.floor(u.wagered / 100);
          return (
            <div
              key={u.key}
              className="grid grid-cols-5 p-4 border border-[#24172A] border-t-2 rounded-lg shadow"
              style={{ boxShadow: '0 2px 12px 0 rgba(183,28,28,0.10)' }}
            >
              <div>#{idx + 1}</div>
              <div>{maskUsername(u.username)}</div>
              <div>{formatCurrency(u.wagered)}</div>
              <div className="font-semibold">{formatCurrency(reward)}</div>
              <div>{tickets}</div>
            </div>
          );
        })}
      </div>

      {looksBroken && (
        <div className="mt-6 bg-white rounded-xl shadow p-4 border border-rose-300">
          <div className="font-semibold mb-2">Debug (shape mismatch)</div>
          <div className="text-sm text-gray-700 mb-2">
            We received rows, but none had a usable <b>username</b> or <b>wager</b> field with our current mapping.
            Here are the first 3 raw rows + their keys:
          </div>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(
              {
                url,
                sinceLabel,
                firstRowKeys: rowsRaw?.[0] ? Object.keys(rowsRaw[0]) : [],
                sampleRows: rowsRaw.slice(0, 3),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </main>
  );
}
