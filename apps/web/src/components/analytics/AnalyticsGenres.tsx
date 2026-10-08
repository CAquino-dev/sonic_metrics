import { useState } from "react";
import { ChevronLeft, ChevronRight, Tags } from "lucide-react";

import type { AnalyticsGenre } from "@/types/analytics";

interface AnalyticsGenresProps {
  genres: AnalyticsGenre[];
  loading: boolean;
  error: boolean;
}

const GENRES_PER_PAGE = 5;

export default function AnalyticsGenres({
  genres,
  loading,
  error,
}: AnalyticsGenresProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(genres.length / GENRES_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) * GENRES_PER_PAGE;

  const visibleGenres = genres.slice(
    startIndex,
    startIndex + GENRES_PER_PAGE,
  );

  const totalArtistCount = genres.reduce(
    (total, genre) => total + genre.artist_count,
    0,
  );

  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < totalPages;

  return (
    <section className="flex h-full flex-col border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <div>
          <span className="text-xs font-black tracking-[0.15em] sm:text-sm">
            GENRE_DISTRIBUTION
          </span>

          <p className="mt-1 text-[10px] text-neutral-500">
            Genre representation across your top artists
          </p>
        </div>

        <Tags size={18} strokeWidth={2} />
      </div>

      {loading ? (
        <GenresSkeleton />
      ) : error ? (
        <div className="flex-1 p-5">
          <EmptyState text="GENRE_DATA_UNAVAILABLE" />
        </div>
      ) : genres.length === 0 ? (
        <div className="flex-1 p-5">
          <EmptyState text="NO_GENRE_DATA" />
        </div>
      ) : (
        <>
          <div className="flex-1 p-5">
            <div className="space-y-5">
              {visibleGenres.map((genre) => {
                const percentage =
                  totalArtistCount > 0
                    ? (genre.artist_count / totalArtistCount) * 100
                    : 0;

                return (
                  <GenreRow
                    key={genre.genre}
                    genre={genre}
                    percentage={percentage}
                  />
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-auto flex items-center justify-between border-t-2 border-black px-4 py-3">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400">
                PAGE {safeCurrentPage} / {totalPages}
              </span>

              <div className="flex gap-2">
                <PaginationButton
                  disabled={!canGoPrevious}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  ariaLabel="Previous genre page"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </PaginationButton>

                <PaginationButton
                  disabled={!canGoNext}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  ariaLabel="Next genre page"
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

function GenreRow({
  genre,
  percentage,
}: {
  genre: AnalyticsGenre;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-5 shrink-0 text-[10px] font-black text-neutral-400">
            {String(genre.rank).padStart(2, "0")}
          </span>

          <span className="truncate text-sm font-bold uppercase">
            {genre.genre}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[10px] font-bold text-neutral-400 sm:block">
            {genre.artist_count} ARTISTS
          </span>

          <span className="w-12 text-right text-[10px] font-black">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-6 border-2 border-black bg-white">
        <div
          className="h-full bg-yellow-300 transition-all"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
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
      className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function GenresSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-5">
      {Array.from({ length: GENRES_PER_PAGE }).map(
        (_, index) => (
          <div key={index}>
            <div className="mb-2 flex justify-between gap-4">
              <div className="h-4 w-28 animate-pulse bg-neutral-200" />

              <div className="h-3 w-16 animate-pulse bg-neutral-200" />
            </div>

            <div className="h-6 animate-pulse bg-neutral-200" />
          </div>
        ),
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-neutral-300 px-4 py-8 text-center text-[10px] font-bold tracking-[0.2em] text-neutral-400">
      {text}
    </div>
  );
}