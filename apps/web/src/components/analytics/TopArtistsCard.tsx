import type { AnalyticsArtist } from "@/types/analytics";

import { ArtistsSkeleton } from "@/components/analytics/DashboardSkeletons";

interface TopArtistsCardProps {
  artists: AnalyticsArtist[];
  loading: boolean;
  error: boolean;
  timeRangeLabel: string;
}

export default function TopArtistsCard({
  artists,
  loading,
  error,
  timeRangeLabel,
}: TopArtistsCardProps) {
  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
          TOP_ARTISTS_DENSITY
        </span>

        <span className="text-[10px] tracking-widest text-neutral-500">
          PERIOD: {timeRangeLabel}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {loading ? (
          <ArtistsSkeleton />
        ) : error ? (
          <EmptyState text="ARTIST_DATA_UNAVAILABLE" />
        ) : (
          <>
            {artists.slice(0, 5).map(
              (artist, index) => {
                const visualWidth =
                  100 - index * 15;

                return (
                  <div
                    key={artist.id}
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-[10px] font-bold text-neutral-400">
                          {String(
                            artist.rank,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span className="truncate text-sm font-bold">
                          {artist.name}
                        </span>
                      </div>

                      <span className="shrink-0 text-[10px] font-bold text-neutral-400">
                        RANK_
                        {artist.rank}
                      </span>
                    </div>

                    <div className="h-7 border-2 border-black bg-white">
                      <div
                        className="h-full bg-green-400 transition-all"
                        style={{
                          width: `${visualWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}

            {artists.length ===
              0 && (
              <EmptyState text="NO_ARTIST_DATA" />
            )}
          </>
        )}
      </div>
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