import { History, Music2 } from "lucide-react";

import type { RecentlyPlayedTrack } from "@/types/spotify";

import { RecentlyPlayedSkeleton } from "@/components/analytics/DashboardSkeletons";

interface RecentlyPlayedCardProps {
  recentlyPlayed: RecentlyPlayedTrack[];
  loading: boolean;
  error: boolean;
}

export default function RecentlyPlayedCard({
  recentlyPlayed,
  loading,
  error,
}: RecentlyPlayedCardProps) {
  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
          STREAM_CHRONOLOGY
        </span>

        <History
          size={16}
          strokeWidth={2}
        />
      </div>

      {loading ? (
        <div className="p-5">
          <RecentlyPlayedSkeleton />
        </div>
      ) : error ? (
        <div className="p-5">
          <EmptyState text="RECENT_STREAM_DATA_UNAVAILABLE" />
        </div>
      ) : (
        <>
          <ul>
            {recentlyPlayed
              .slice(0, 5)
              .map((event) => {
                const date = new Date(
                  event.played_at,
                );

                return (
                  <li
                    key={`${event.played_at}-${event.track.id}`}
                    className="flex items-start gap-4 border-b border-neutral-200 px-5 py-4 last:border-b-0"
                  >
                    <span className="w-12 shrink-0 pt-0.5 text-sm text-neutral-500">
                      {date.toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        },
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold tracking-wide">
                        {event.track.name}
                      </div>

                      <div className="mt-1 truncate text-xs text-neutral-600">
                        {event.track.artists
                          .map(
                            (artist) =>
                              artist.name,
                          )
                          .join(", ")}

                        {" — "}

                        {event.track.album.name}
                      </div>
                    </div>

                    <Music2
                      size={16}
                      strokeWidth={2}
                      className="shrink-0"
                    />
                  </li>
                );
              })}
          </ul>

          {recentlyPlayed.length === 0 && (
            <div className="px-5 py-6">
              <EmptyState text="NO_RECENT_STREAM_DATA" />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border-2 border-dashed border-neutral-300 px-4 py-6 text-center text-[10px] font-bold tracking-[0.2em] text-neutral-400">
      {text}
    </div>
  );
}