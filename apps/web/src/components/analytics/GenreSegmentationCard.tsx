import { GenresSkeleton } from "@/components/analytics/DashboardSkeletons";

export interface GenreDisplay {
  label: string;
  artistCount: number;
  percent: number;
  color: string;
}

interface GenreSegmentationCardProps {
  genres: GenreDisplay[];
  genreCount: number;
  loading: boolean;
  error: boolean;
}

export default function GenreSegmentationCard({
  genres,
  genreCount,
  loading,
  error,
}: GenreSegmentationCardProps) {
  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
          GENRE_SEGMENTATION
        </span>

        <span className="text-[10px] tracking-widest text-neutral-500">
          TOP 5 GENRES
        </span>
      </div>

      <div className="p-5">
        {loading ? (
          <GenresSkeleton />
        ) : error ? (
          <EmptyState text="GENRE_DATA_UNAVAILABLE" />
        ) : (
          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center">
            <DonutChart
              data={genres}
              centerLabel={String(
                genreCount,
              )}
            />

            <div className="w-full flex-1">
              <div className="mb-4 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                TOP_GENRES_BY_ARTIST_COUNT_
              </div>

              <ul className="flex flex-col gap-3 text-sm font-bold">
                {genres.map(
                  (genre) => (
                    <li
                      key={
                        genre.label
                      }
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 shrink-0 border-2 border-black"
                          style={{
                            backgroundColor:
                              genre.color,
                          }}
                        />

                        <span className="truncate">
                          {
                            genre.label
                          }
                        </span>
                      </div>

                      <span className="shrink-0 text-xs">
                        {
                          genre.artistCount
                        }{" "}
                        ARTISTS
                      </span>
                    </li>
                  ),
                )}
              </ul>

              {genres.length ===
                0 && (
                <div className="mt-4">
                  <EmptyState text="NO_GENRE_DATA" />
                </div>
              )}

              <div className="mt-5 border-l-4 border-black pl-3 text-xs leading-relaxed text-neutral-600">
                GENRE_DATA IS BASED
                ON ARTIST
                CLASSIFICATION.
                VALUES REPRESENT
                ARTIST_COUNT, NOT
                LISTENING TIME.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface DonutSlice {
  label: string;
  color: string;
  dash: number;
  gap: number;
  offset: number;
}

function DonutChart({
  data,
  centerLabel,
}: {
  data: GenreDisplay[];
  centerLabel: string;
}) {
  const radius = 60;
  const stroke = 24;

  const circumference =
    2 * Math.PI * radius;

  const slices =
    data.reduce<
      DonutSlice[]
    >(
      (
        acc,
        slice,
      ) => {
        const dash =
          (slice.percent / 100) *
          circumference;

        const gap =
          circumference -
          dash;

        const previousOffset =
          acc.length > 0
            ? acc[
                acc.length - 1
              ].offset +
              acc[
                acc.length - 1
              ].dash
            : 0;

        acc.push({
          label:
            slice.label,
          color:
            slice.color,
          dash,
          gap,
          offset:
            previousOffset,
        });

        return acc;
      },
      [],
    );

  return (
    <div className="shrink-0">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label="Genre distribution"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={stroke}
        />

        <g transform="rotate(-90 80 80)">
          {slices.map(
            (slice) => (
              <circle
                key={
                  slice.label
                }
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={
                  slice.color
                }
                strokeWidth={
                  stroke
                }
                strokeDasharray={`${slice.dash} ${slice.gap}`}
                strokeDashoffset={
                  -slice.offset
                }
              />
            ),
          )}
        </g>

        <text
          x="80"
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-black font-black"
          fontSize="28"
        >
          {centerLabel}
        </text>

        <text
          x="80"
          y="105"
          textAnchor="middle"
          className="fill-neutral-500"
          fontSize="9"
          letterSpacing="2"
        >
          GENRES
        </text>
      </svg>
    </div>
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