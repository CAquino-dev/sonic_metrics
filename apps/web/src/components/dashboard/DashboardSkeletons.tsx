import { Skeleton } from "@/components/ui/skeleton";

// Helper: brutalist skeleton block
// Override shadcn's default rounded corners + use hard shadow
function Block({ className = "" }: { className?: string }) {
  return (
    <Skeleton
      className={[
        "rounded-none",
        "border-2 border-black",
        "bg-neutral-200",
        "shadow-[3px_3px_0_0_#000]",
        className,
      ].join(" ")}
    />
  );
}

// ------------------------------------------------------------
// PROFILE SKELETON
// Matches: avatar (4:3 box) + name + product line + 2 stat cards
// ------------------------------------------------------------

export function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      {/* Avatar block — mirrors aspect-4/3 container */}
      <Block className="aspect-4/3 w-full rotate-[-0.4deg]" />

      {/* Display name */}
      <Block className="h-8 w-3/4 rotate-[0.3deg]" />

      {/* Spotify account line */}
      <Block className="h-3 w-1/2 rotate-[-0.2deg]" />

      {/* Two stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border-2 border-black bg-white py-3 shadow-[3px_3px_0_0_#000]">
          <div className="mx-auto h-3 w-16 bg-neutral-200" />
          <div className="mx-auto mt-2 h-4 w-12 bg-neutral-300" />
        </div>
        <div className="border-2 border-black bg-white py-3 shadow-[3px_3px_0_0_#000]">
          <div className="mx-auto h-3 w-16 bg-neutral-200" />
          <div className="mx-auto mt-2 h-4 w-12 bg-neutral-300" />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// ARTISTS SKELETON
// Matches: rank / name / RANK_xx header + bordered bar
// ------------------------------------------------------------

export function ArtistsSkeleton() {
  // Descending bar widths to mimic the "ranking" visual
  const barWidths = ["100%", "85%", "70%", "55%", "40%"];

  return (
    <div className="space-y-5">
      {barWidths.map((width, index) => (
        <div
          key={index}
          className={
            index % 2 === 0
              ? "rotate-[-0.3deg]"
              : "rotate-[0.3deg]"
          }
        >
          {/* Header row */}
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Block className="h-4 w-6 shrink-0" />
              <Block className="h-4 flex-1 max-w-xs" />
            </div>
            <Block className="h-3 w-14 shrink-0" />
          </div>

          {/* Bordered bar track — matches h-7 border-2 structure */}
          <div className="h-7 border-2 border-black bg-white shadow-[3px_3px_0_0_#000]">
            <div
              className="h-full border-r-2 border-black bg-neutral-300"
              style={{ width }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// GENRES SKELETON
// Matches: donut + legend list layout
// ------------------------------------------------------------

export function GenresSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center">
      {/* Donut placeholder */}
      <div className="shrink-0 border-2 border-black bg-white p-2 shadow-[4px_4px_0_0_#000] rotate-[-0.5deg]">
        <div className="h-[160px] w-[160px] border-4 border-dashed border-neutral-300" />
      </div>

      {/* Legend + note */}
      <div className="w-full flex-1">
        <Block className="mb-4 h-3 w-48" />

        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className={
                "flex items-center justify-between gap-4 " +
                (index % 2 === 0
                  ? "rotate-[-0.2deg]"
                  : "rotate-[0.2deg]")
              }
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Block className="h-4 w-4 shrink-0" />
                <Block className="h-4 w-full max-w-[10rem]" />
              </div>
              <Block className="h-3 w-16 shrink-0" />
            </li>
          ))}
        </ul>

        {/* Footnote bar */}
        <div className="mt-5 border-l-4 border-black pl-3">
          <Block className="h-3 w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// RECENTLY PLAYED SKELETON
// Matches: time / track / artist-album row + music icon
// ------------------------------------------------------------

export function RecentlyPlayedSkeleton() {
  return (
    <ul>
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="flex items-start gap-4 border-b border-neutral-200 px-0 py-4 last:border-b-0"
        >
          {/* Timestamp */}
          <Block className="h-4 w-12 shrink-0" />

          {/* Track info */}
          <div className="min-w-0 flex-1 space-y-2">
            <Block
              className={
                "h-4 max-w-[16rem] " +
                (index % 2 === 0
                  ? "rotate-[-0.2deg]"
                  : "rotate-[0.2deg]")
              }
            />
            <Block className="h-3 max-w-[12rem]" />
          </div>

          {/* Music icon placeholder */}
          <Block className="h-4 w-4 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------
// SUMMARY SKELETON
// Matches: 3 bordered stat cards with bg + label + value + icon
// ------------------------------------------------------------

export function SummarySkeleton() {
  const bgs = ["bg-neutral-200", "bg-neutral-200", "bg-neutral-300"];

  return (
    <>
      {bgs.map((bg, index) => (
        <div
          key={index}
          className={[
            "flex items-center justify-between",
            "border-2 border-black",
            "px-5 py-4",
            "shadow-[3px_3px_0_0_#000]",
            bg,
            index % 2 === 0
              ? "rotate-[-0.3deg]"
              : "rotate-[0.3deg]",
          ].join(" ")}
        >
          <div className="space-y-2">
            <div className="h-3 w-24 border-2 border-black bg-white/60" />
            <div className="h-4 w-16 border-2 border-black bg-white/60" />
          </div>

          <div className="h-5 w-5 border-2 border-black bg-white/60" />
        </div>
      ))}
    </>
  );
}