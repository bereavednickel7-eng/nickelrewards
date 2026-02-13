"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "00d 00h 00m 00s";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${days.toString().padStart(2, "0")}d ${hours
    .toString()
    .padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0")}s`;
}

export default function Countdown({
  endIsoUtc,
  repeatDays,
  repeatMonths,
}: {
  endIsoUtc: string;
  repeatDays?: number;
  repeatMonths?: number;
}) {
  const initialEnd = useMemo(() => new Date(endIsoUtc).getTime(), [endIsoUtc]);
  const [end, setEnd] = useState(initialEnd);
  const [label, setLabel] = useState("—");

  useEffect(() => {
    setEnd(initialEnd);
  }, [initialEnd]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const remaining = end - now;
      if (remaining <= 0) {
        if (repeatDays) {
          setEnd((prevEnd) => prevEnd + repeatDays * 24 * 60 * 60 * 1000);
        } else if (repeatMonths) {
          // Add repeatMonths months to the previous end date
          const prev = new Date(end);
          prev.setUTCMonth(prev.getUTCMonth() + repeatMonths);
          setEnd(prev.getTime());
        } else {
          setLabel(formatRemaining(0));
        }
      } else {
        setLabel(formatRemaining(remaining));
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end, repeatDays, repeatMonths]);

  return <>{label}</>;
}
