import {
  Hash,
  Music2,
  Users,
} from "lucide-react";

import type { AnalyticsOverview } from "@/types/analytics";

interface AnalyticsSummaryProps {
  overview: AnalyticsOverview | null;
  loading: boolean;
  error: boolean;
}

export default function AnalyticsSummary({
  overview,
  loading,
  error,
}: AnalyticsSummaryProps) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black tracking-[0.15em]">
          LISTENING_SUMMARY
        </span>

        <span className="text-[10px] font-bold tracking-widest text-neutral-400">
          OVERVIEW
        </span>
      </div>

      {loading ? (
        <SummarySkeleton />
      ) : error ? (
        <EmptyState text="ANALYTICS_DATA_UNAVAILABLE" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="ARTISTS_ANALYZED"
            value={overview?.artist_count ?? 0}
            icon={<Users size={20} strokeWidth={2} />}
            className="bg-yellow-300"
          />

          <SummaryCard
            label="TRACKS_ANALYZED"
            value={overview?.track_count ?? 0}
            icon={<Music2 size={20} strokeWidth={2} />}
            className="bg-green-400"
          />

          <SummaryCard
            label="GENRES_DETECTED"
            value={overview?.genre_count ?? 0}
            icon={<Hash size={20} strokeWidth={2} />}
            className="bg-black text-white"
          />
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={[
        "flex min-h-28 items-center justify-between",
        "border-2 border-black px-5 py-4",
        "shadow-[4px_4px_0_0_#000]",
        className,
      ].join(" ")}
    >
      <div>
        <div className="text-[10px] font-black tracking-[0.2em]">
          {label}
        </div>

        <div className="mt-2 text-3xl font-black tracking-tight">
          {value}
        </div>
      </div>

      {icon}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-h-28 border-2 border-neutral-300 bg-white px-5 py-4"
        >
          <div className="h-3 w-28 animate-pulse bg-neutral-200" />
          <div className="mt-4 h-8 w-16 animate-pulse bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-[10px] font-bold tracking-[0.2em] text-neutral-400">
      {text}
    </div>
  );
}