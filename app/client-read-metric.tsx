"use client";

import { useState } from "react";
import type { GuestbookDatabase } from "./actions";

type MetricState = {
  endToEndMs: number;
  serverReadMs: number;
};

type Props = {
  database: GuestbookDatabase;
};

export default function ClientReadMetric({ database }: Props) {
  const [metric, setMetric] = useState<MetricState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const measure = async () => {
    setIsLoading(true);
    const start = performance.now();
    const response = await fetch(`/api/guestbook?db=${database}`, { cache: "no-store" });
    const payload = (await response.json()) as { readMs: number };

    requestAnimationFrame(() => {
      setMetric({
        endToEndMs: Number((performance.now() - start).toFixed(2)),
        serverReadMs: Number(payload.readMs.toFixed(2)),
      });
      setIsLoading(false);
    });
  };

  return (
    <section className="mt-4 rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/15 dark:bg-black/50">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">User-perceived read time ({database})</p>
        <button
          type="button"
          onClick={() => void measure()}
          className="rounded-md border border-black/20 px-3 py-1 text-xs font-medium hover:bg-black/5 disabled:opacity-60 dark:border-white/25 dark:hover:bg-white/10"
          disabled={isLoading}
        >
          {isLoading ? "Measuring..." : "Measure"}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        Click measure to test browser-to-screen timing for the selected database.
      </p>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        End-to-end (browser request to paint):{" "}
        <span className="font-semibold text-foreground">
          {metric ? `${metric.endToEndMs} ms` : "—"}
        </span>
      </p>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Server database read only:{" "}
        <span className="font-semibold text-foreground">
          {metric ? `${metric.serverReadMs} ms` : "—"}
        </span>
      </p>
    </section>
  );
}
