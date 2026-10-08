import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import type { AnalyticsArtist } from "@/types/analytics";

interface AnalyticsArtistsProps {
  artists: AnalyticsArtist[];
  loading: boolean;
  error: boolean;
}

const ARTISTS_PER_PAGE = 5;

export default function AnalyticsArtists({
  artists,
  loading,
  error,
}: AnalyticsArtistsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(artists.length / ARTISTS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) * ARTISTS_PER_PAGE;

  const visibleArtists = artists.slice(
    startIndex,
    startIndex + ARTISTS_PER_PAGE,
  );

  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < totalPages;

  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <div>
          <span className="text-xs font-black tracking-[0.15em] sm:text-sm">
            TOP_ARTISTS
          </span>

          <p className="mt-1 text-[10px] text-neutral-500">
            Ranked by Spotify listening preference
          </p>
        </div>

        <Users size={18} strokeWidth={2} />
      </div>

      {loading ? (
        <ArtistsSkeleton />
      ) : error ? (
        <div className="p-5">
          <EmptyState text="ARTIST_DATA_UNAVAILABLE" />
        </div>
      ) : artists.length === 0 ? (
        <div className="p-5">
          <EmptyState text="NO_ARTIST_DATA" />
        </div>
      ) : (
        <>
          <div>
            {visibleArtists.map((artist) => (
              <ArtistRow
                key={artist.id}
                artist={artist}
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
                  ariaLabel="Previous artist page"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </PaginationButton>

                <PaginationButton
                  disabled={!canGoNext}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  ariaLabel="Next artist page"
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

function ArtistRow({
  artist,
}: {
  artist: AnalyticsArtist;
}) {
  const image = artist.images[0]?.url;

  return (
    <div className="flex items-center gap-4 border-b border-neutral-200 px-4 py-4 last:border-b-0 sm:px-5">
      <span className="w-6 shrink-0 text-right text-xs font-black text-neutral-400">
        {String(artist.rank).padStart(2, "0")}
      </span>

      <div className="h-12 w-12 shrink-0 overflow-hidden border-2 border-black bg-neutral-200">
        {image ? (
          <img
            src={image}
            alt={artist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">
          {artist.name}
        </div>

        {artist.genres.length > 0 ? (
          <div className="mt-1 flex gap-1 overflow-hidden">
            {artist.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="truncate border border-neutral-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-500"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : (
          <span className="mt-1 block text-[10px] text-neutral-400">
            NO_GENRE_DATA
          </span>
        )}
      </div>

      <span className="hidden shrink-0 text-[10px] font-black tracking-widest text-neutral-400 sm:block">
        RANK_{artist.rank}
      </span>
    </div>
  );
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

function ArtistsSkeleton() {
  return (
    <div>
      {Array.from({ length: ARTISTS_PER_PAGE }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-neutral-200 px-4 py-4 last:border-b-0 sm:px-5"
        >
          <div className="h-3 w-6 animate-pulse bg-neutral-200" />

          <div className="h-12 w-12 shrink-0 animate-pulse bg-neutral-200" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-32 max-w-full animate-pulse bg-neutral-200" />

            <div className="h-3 w-24 animate-pulse bg-neutral-200" />
          </div>

          <div className="hidden h-3 w-12 animate-pulse bg-neutral-200 sm:block" />
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