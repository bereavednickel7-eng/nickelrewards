  function maskUsername(name: string) {
    if (!name || name.length < 4) return name;
    return name.slice(0, 2) + '***' + name.slice(-2);
  }
import Image from "next/image";
import Countdown from "./Countdown";

const USER_ID = "8a58f75b-71f1-47e1-a2d8-00e4a61fd1c4"; // hardcoded

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

function startOfMonthUTCISO() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  return start.toISOString();
}

function startOfNextMonthUTCISO() {
  const now = new Date();
  const startNext = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return startNext.toISOString();
}

type RoobetRow = {
  uid: string;
  username: string;
  weightedWagered?: number;
};

export default async function RoobetPage() {
  const key = process.env.ROOBET_API_KEY;

  if (!key) {
    return (
      <main className="min-h-screen bg-blue-200 text-black p-10">
        <h1 className="text-3xl font-bold mb-4">Roobet Leaderboard</h1>
        <div className="bg-white rounded-xl shadow p-4 border border-rose-300">
          <div className="font-semibold mb-2">API error</div>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify({ error: "Missing ROOBET_API_KEY in .env.local" }, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  const startDate = startOfMonthUTCISO();          // e.g. 2026-02-01T00:00:00.000Z
  const endDate = startOfNextMonthUTCISO();        // e.g. 2026-03-01T00:00:00.000Z

  const url =
    `https://roobetconnect.com/affiliate/v2/stats` +
    `?userId=${encodeURIComponent(USER_ID)}` +
    `&startDate=${encodeURIComponent(startDate)}` +
    `&endDate=${encodeURIComponent(new Date().toISOString())}` +
    `&sortBy=wagered`;

  let rows: RoobetRow[] = [];
  let apiError: any = null;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      apiError = {
        error: `Roobet API failed (${res.status})`,
        body: text,
        url,
      };
    } else {
      rows = JSON.parse(text) as RoobetRow[];
    }
  } catch (e: any) {
    apiError = { error: "Fetch crashed", message: e?.message ?? String(e), url };
  }

  if (apiError) {
    return (
      <main className="min-h-screen bg-blue-200 text-black p-10">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/Roobet-logo.png" alt="Roobet" width={120} height={40} />
          <h1 className="text-3xl font-bold">Roobet Leaderboard</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-rose-300">
          <div className="font-semibold mb-2">API error</div>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(apiError, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  const sorted = [...rows].sort(
    (a, b) => (b.weightedWagered ?? 0) - (a.weightedWagered ?? 0)
  );

  const top15 = sorted.slice(0, 15);
  const rewards = [1425, 750, 375, 150, 100, 50, 50, 50, 25, 25];

  return (
    <main className="min-h-screen bg-blue-200 text-black p-10">
      <div className="flex items-center gap-3 mb-2">
        <a href="/clash">
          <Image src="/Roobet-logo.png" alt="Roobet" width={120} height={40} />
        </a>
        <h1 className="text-3xl font-bold">Roobet Leaderboard</h1>
      </div>

      <div className="text-sm text-gray-700 mb-6">
        Ranked by <b> wagered </b> since <b>{startDate.slice(0, 10)}</b> (UTC).
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 w-56">
          <div className="text-xs uppercase text-gray-600 tracking-wide">Prize Pool</div>
          <div className="text-lg font-bold">$3,000.00</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 w-56">
          <div className="text-xs uppercase text-gray-600 tracking-wide">Ends In</div>
          <div className="text-lg font-bold">
            <Countdown endIsoUtc={endDate} repeatMonths={1} />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Ends at <b>{endDate.slice(0, 10)}</b> (UTC)
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

        {top15.map((u, idx) => {
          const reward = rewards[idx];
          return (
            <div
              key={u.uid ?? `${u.username}-${idx}`}
              className="grid grid-cols-4 p-4 border-t border-blue-200"
            >
              <div>#{idx + 1}</div>
              <div>{maskUsername(u.username ?? "—")}</div>
              <div>{formatCurrency(u.weightedWagered ?? 0)}</div>
              <div className="font-semibold">{reward ? formatCurrency(reward) : ""}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
