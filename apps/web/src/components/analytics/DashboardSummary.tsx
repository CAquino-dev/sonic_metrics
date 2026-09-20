import type { ReactNode } from "react";
import { Music2, Users } from "lucide-react";

import type { AnalyticsOverview } from "@/types/analytics";
import { SummarySkeleton } from "@/components/analytics/DashboardSkeletons";

interface DashboardSummaryProps {
  overview: AnalyticsOverview | null;
  loading: boolean;
  error: boolean;
}

export default function DashboardSummary({
  overview,
  loading,
  error,
}: DashboardSummaryProps) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {loading ? (
        <SummarySkeleton />
      ) : error ? (
        <div className="sm:col-span-3">
          <EmptyState text="ANALYTICS_DATA_UNAVAILABLE" />
        </div>
      ) : (
        <>
          <StatCard
            label="ARTISTS_ANALYZED"
            value={String(overview?.artist_count ?? 0)}
            bg="bg-yellow-300"
            icon={<Users size={18} strokeWidth={2} />}
          />

          <StatCard
            label="TRACKS_ANALYZED"
            value={String(overview?.track_count ?? 0)}
            bg="bg-green-400"
            icon={<Music2 size={18} strokeWidth={2} />}
          />

          <StatCard
            label="GENRES_DETECTED"
            value={String(overview?.genre_count ?? 0)}
            bg="bg-black text-white"
            icon={<span className="text-lg font-black">#</span>}
          />
        </>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  bg,
  icon,
}: {
  label: string;
  value: string;
  bg: string;
  icon: ReactNode;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between",
        "border-2 border-black",
        "px-5 py-4",
        bg,
      ].join(" ")}
    >
      <div>
        <div className="text-[10px] font-bold tracking-[0.2em]">
          {label}
        </div>

        <div className="mt-1 text-sm font-black">
          {value}
        </div>
      </div>

      {icon}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-neutral-300 px-4 py-6 text-center text-[10px] font-bold tracking-[0.2em] text-neutral-400">
      {text}
    </div>
  );
}