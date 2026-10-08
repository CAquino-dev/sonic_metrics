import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Music2,
} from "lucide-react";

import type { AnalyticsTrack } from "@/types/analytics";

interface AnalyticsTracksProps {
  tracks: AnalyticsTrack[];
  loading: boolean;
  error: boolean;
}

const TRACKS_PER_PAGE = 5;

export default function AnalyticsTracks({
  tracks,
  loading,
  error,
}: AnalyticsTracksProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(tracks.length / TRACKS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) * TRACKS_PER_PAGE;

  const visibleTracks = tracks.slice(
    startIndex,
    startIndex + TRACKS_PER_PAGE,
  );

  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < totalPages;

  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <div>
          <span className="text-xs font-black tracking-[0.15em] sm:text-sm">
            TOP_TRACKS
          </span>

          <p className="mt-1 text-[10px] text-neutral-500">
            Your most preferred tracks for the selected period
          </p>
        </div>

        <Music2 size={18} strokeWidth={2} />
      </div>

      {loading ? (
        <TracksSkeleton />
      ) : error ? (
        <div className="p-5">
          <EmptyState text="TRACK_DATA_UNAVAILABLE" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="p-5">
          <EmptyState text="NO_TRACK_DATA" />
        </div>
      ) : (
        <>
          <div>
            {visibleTracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t-2 border-black px-4 py-3">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400">
                PAGE {safeCurrentPage} / {totalPages}
              </span>

              <div className="flex gap-2">
                <PaginationButton
                  disabled={!canGoPrevious}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  ariaLabel="Previous track page"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </PaginationButton>

                <PaginationButton
                  disabled={!canGoNext}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  ariaLabel="Next track page"
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </PaginationButton>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TrackRow({
  track,
}: {
  track: AnalyticsTrack;
}) {
  const image = track.album.images[0]?.url;

  return (
    <div className="flex items-center gap-4 border-b border-neutral-200 px-4 py-4 last:border-b-0 sm:px-5">
      <span className="w-6 shrink-0 text-right text-xs font-black text-neutral-400">
        {String(track.rank).padStart(2, "0")}
      </span>

      <div className="h-12 w-12 shrink-0 overflow-hidden border-2 border-black bg-neutral-200">
        {image ? (
          <img
            src={image}
            alt={track.album.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">
          {track.name}
        </div>

        <div className="mt-1 truncate text-xs text-neutral-600">
          {track.artists.map((artist) => artist.name).join(", ")}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide text-neutral-400">
          <span className="truncate">
            {track.album.name}
          </span>

          {track.explicit && (
            <>
              <span>•</span>

              <span className="shrink-0 border border-neutral-300 px-1 py-0.5">
                E
              </span>
            </>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500">
          <Clock3 size={12} strokeWidth={2} />

          {formatDuration(track.duration_ms)}
        </div>

        {track.popularity !== null && (
          <div className="text-[10px] font-black">
            POP_{track.popularity}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PaginationButton({
  children,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function TracksSkeleton() {
  return (
    <div className="min-h-[720px]">
      {Array.from({ length: TRACKS_PER_PAGE }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-neutral-200 px-4 py-4 last:border-b-0 sm:px-5"
        >
          <div className="h-3 w-6 animate-pulse bg-neutral-200" />

          <div className="h-12 w-12 shrink-0 animate-pulse bg-neutral-200" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 max-w-full animate-pulse bg-neutral-200" />

            <div className="h-3 w-28 max-w-full animate-pulse bg-neutral-200" />

            <div className="h-2 w-32 max-w-full animate-pulse bg-neutral-200" />
          </div>

          <div className="hidden space-y-2 sm:block">
            <div className="h-3 w-12 animate-pulse bg-neutral-200" />

            <div className="ml-auto h-3 w-10 animate-pulse bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border-2 border-dashed border-neutral-300 px-4 py-8 text-center text-[10px] font-bold tracking-[0.2em] text-neutral-400">
      {text}
    </div>
  );
}