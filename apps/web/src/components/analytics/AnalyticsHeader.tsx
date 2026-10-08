import { BarChart3 } from "lucide-react";

export default function AnalyticsHeader() {
  return (
    <header className="border-2 border-black bg-black px-5 py-5 text-white shadow-[4px_4px_0_0_#000] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 size={22} strokeWidth={2} />

            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              ANALYTICS
            </h1>
          </div>

          <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-300 sm:text-sm">
            Explore your listening patterns, top artists, tracks, and genre
            distribution across different time periods.
          </p>
        </div>

        <span className="hidden shrink-0 border border-white px-2 py-1 text-[9px] font-bold tracking-[0.2em] sm:block">
          MUSIC_DATA
        </span>
      </div>
    </header>
  );
}