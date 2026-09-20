// apps/web/src/pages/Dashboard.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  History,
  Music2,
  Settings,
  Users,
} from "lucide-react";

import {
  getAnalyticsArtists,
  getAnalyticsGenres,
  getAnalyticsOverview,
} from "../services/analytics";

import {
  getMe,
  getRecentlyPlayed,
} from "../services/spotify";

import type {
  RecentlyPlayedTrack,
  SpotifyUser,
} from "../types/spotify";

import type {
  AnalyticsArtist,
  AnalyticsGenre,
  AnalyticsOverview,
} from "../types/analytics";

import {
  ArtistsSkeleton,
  GenresSkeleton,
  ProfileSkeleton,
  RecentlyPlayedSkeleton,
  SummarySkeleton,
} from "@/components/analytics/DashboardSkeletons";

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const GENRE_COLORS = [
  "#4ade80",
  "#facc15",
  "#111111",
  "#fb7185",
  "#60a5fa",
];

const TIME_RANGE_LABELS: Record<string, string> = {
  short_term: "LAST 4 WEEKS",
  medium_term: "LAST 6 MONTHS",
  long_term: "ALL TIME",
};

// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------

export default function Dashboard() {
  const [profile, setProfile] =
    useState<SpotifyUser | null>(null);

  const [artists, setArtists] =
    useState<AnalyticsArtist[]>([]);

  const [genres, setGenres] =
    useState<AnalyticsGenre[]>([]);

  const [recentlyPlayed, setRecentlyPlayed] =
    useState<RecentlyPlayedTrack[]>([]);

  const [overview, setOverview] =
    useState<AnalyticsOverview | null>(null);

  // ----------------------------------------------------------
  // LOADING STATES
  // ----------------------------------------------------------

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [artistsLoading, setArtistsLoading] =
    useState(true);

  const [genresLoading, setGenresLoading] =
    useState(true);

  const [recentlyPlayedLoading, setRecentlyPlayedLoading] =
    useState(true);

  const [overviewLoading, setOverviewLoading] =
    useState(true);

  // ----------------------------------------------------------
  // ERROR STATES
  // ----------------------------------------------------------

  const [profileError, setProfileError] =
    useState(false);

  const [artistsError, setArtistsError] =
    useState(false);

  const [genresError, setGenresError] =
    useState(false);

  const [recentlyPlayedError, setRecentlyPlayedError] =
    useState(false);

  const [overviewError, setOverviewError] =
    useState(false);

  // ----------------------------------------------------------
  // LOAD PROFILE
  // ----------------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(false);

        const data = await getMe();

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error,
        );

        setProfileError(true);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ----------------------------------------------------------
  // LOAD OVERVIEW
  // ----------------------------------------------------------

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setOverviewLoading(true);
        setOverviewError(false);

        const data =
          await getAnalyticsOverview(
            "medium_term",
          );

        setOverview(data);
      } catch (error) {
        console.error(
          "Failed to load overview:",
          error,
        );

        setOverviewError(true);
      } finally {
        setOverviewLoading(false);
      }
    };

    loadOverview();
  }, []);

  // ----------------------------------------------------------
  // LOAD ARTISTS
  // ----------------------------------------------------------

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setArtistsLoading(true);
        setArtistsError(false);

        const data =
          await getAnalyticsArtists(
            "medium_term",
            20,
          );

        setArtists(data.artists);
      } catch (error) {
        console.error(
          "Failed to load artists:",
          error,
        );

        setArtistsError(true);
      } finally {
        setArtistsLoading(false);
      }
    };

    loadArtists();
  }, []);

  // ----------------------------------------------------------
  // LOAD GENRES
  // ----------------------------------------------------------

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setGenresLoading(true);
        setGenresError(false);

        const data =
          await getAnalyticsGenres(
            "medium_term",
            20,
          );

        setGenres(data.genres);
      } catch (error) {
        console.error(
          "Failed to load genres:",
          error,
        );

        setGenresError(true);
      } finally {
        setGenresLoading(false);
      }
    };

    loadGenres();
  }, []);

  // ----------------------------------------------------------
  // LOAD RECENTLY PLAYED
  // ----------------------------------------------------------

  useEffect(() => {
    const loadRecentlyPlayed = async () => {
      try {
        setRecentlyPlayedLoading(true);
        setRecentlyPlayedError(false);

        const data =
          await getRecentlyPlayed();

        setRecentlyPlayed(data.items);
      } catch (error) {
        console.error(
          "Failed to load recently played:",
          error,
        );

        setRecentlyPlayedError(true);
      } finally {
        setRecentlyPlayedLoading(false);
      }
    };

    loadRecentlyPlayed();
  }, []);

  // ----------------------------------------------------------
  // GENRE VISUALIZATION
  // ----------------------------------------------------------

  const displayedGenres = useMemo(() => {
    const topGenres = genres.slice(0, 5);

    const total = topGenres.reduce(
      (sum, genre) =>
        sum + genre.artist_count,
      0,
    );

    return topGenres.map(
      (genre, index) => ({
        label: genre.genre,
        artistCount: genre.artist_count,

        /*
         * This percentage is NOT listening share.
         *
         * It only represents the relative
         * artist count among the displayed
         * top genres.
         */
        percent:
          total > 0
            ? Math.round(
                (genre.artist_count / total) *
                  100,
              )
            : 0,

        color:
          GENRE_COLORS[
            index % GENRE_COLORS.length
          ],
      }),
    );
  }, [genres]);

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------

  return (
    <div className="font-mono text-black">
      {/* ------------------------------------------------------
          PAGE HEADER
      ------------------------------------------------------ */}

      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.25em] text-neutral-400">
              SONIC_METRICS / DASHBOARD_
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              LISTENING OVERVIEW
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
            <span className="h-2 w-2 rounded-full border border-black bg-green-400" />
            DATA_STREAM_ACTIVE
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------
          MAIN DASHBOARD GRID
      ------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr]">

        {/* ====================================================
            PROFILE IDENTITY
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="PROFILE_IDENTITY"
            icon={
              <Settings
                size={18}
                strokeWidth={2}
              />
            }
          />

          <div className="p-5">
            {profileLoading ? (
              <ProfileSkeleton />
            ) : profileError ? (
              <EmptyState text="PROFILE_DATA_UNAVAILABLE" />
            ) : (
              <>
                {/* Avatar */}

                <div className="aspect-4/3 w-full overflow-hidden border-2 border-black bg-neutral-800">
                  {profile?.photo ? (
                    <img
                      src={profile.photo}
                      alt={
                        profile.display_name ??
                        "Spotify profile"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-5xl font-black">
                          SM
                        </div>

                        <div className="mt-2 text-[10px] tracking-[0.3em] text-neutral-400">
                          NO_AVATAR
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Username */}

                <h2 className="mt-5 text-3xl font-black">
                  {profile?.display_name ??
                    "UNKNOWN_USER"}
                </h2>

                {/* Spotify account */}

                <p className="mt-1 text-xs tracking-widest text-neutral-600">
                  SPOTIFY_ACCOUNT :{" "}
                  {profile?.spotify_product?.toLocaleUpperCase() ??
                    "UNKNOWN"}
                </p>

                {/* Account information */}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <ProfileStat
                    label="FOLLOWERS"
                    value={(
                      profile?.followers?.total ??
                      0
                    ).toLocaleString()}
                  />

                  <ProfileStat
                    label="COUNTRY"
                    value={
                      profile?.country ??
                      "N/A"
                    }
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ====================================================
            TOP ARTISTS
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="TOP_ARTISTS_DENSITY"
            rightLabel="PERIOD: LAST 6 MONTHS"
          />

          <div className="flex flex-col gap-5 p-5">
            {artistsLoading ? (
              <ArtistsSkeleton />
            ) : artistsError ? (
              <EmptyState text="ARTIST_DATA_UNAVAILABLE" />
            ) : (
              <>
                {artists
                  .slice(0, 5)
                  .map(
                    (
                      artist,
                      index,
                    ) => {
                      /*
                       * We do NOT have listening
                       * percentages.
                       *
                       * The bar is purely a
                       * visual ranking indicator:
                       *
                       * #1 = 100%
                       * #2 = 85%
                       * #3 = 70%
                       * etc.
                       *
                       * This does not represent
                       * actual listening share.
                       */

                      const visualWidth =
                        100 -
                        index * 15;

                      return (
                        <div
                          key={
                            artist.id
                          }
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
                              {
                                artist.rank
                              }
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

        {/* ====================================================
            GENRE SEGMENTATION
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="GENRE_SEGMENTATION"
            rightLabel="TOP 5 GENRES"
          />

          <div className="p-5">
            {genresLoading ? (
              <GenresSkeleton />
            ) : genresError ? (
              <EmptyState text="GENRE_DATA_UNAVAILABLE" />
            ) : (
              <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center">
                <DonutChart
                  data={
                    displayedGenres
                  }
                  centerLabel={String(
                    overview?.genre_count ??
                      0,
                  )}
                />

                <div className="w-full flex-1">
                  <div className="mb-4 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                    TOP_GENRES_BY_ARTIST_COUNT_
                  </div>

                  <ul className="flex flex-col gap-3 text-sm font-bold">
                    {displayedGenres.map(
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

                  {displayedGenres.length ===
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

        {/* ====================================================
            STREAM CHRONOLOGY
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="STREAM_CHRONOLOGY"
            icon={
              <History
                size={16}
                strokeWidth={2}
              />
            }
          />

          {recentlyPlayedLoading ? (
            <div className="p-5">
              <RecentlyPlayedSkeleton />
            </div>
          ) : recentlyPlayedError ? (
            <div className="p-5">
              <EmptyState text="RECENT_STREAM_DATA_UNAVAILABLE" />
            </div>
          ) : (
            <>
              <ul>
                {recentlyPlayed
                  .slice(0, 5)
                  .map((event) => {
                    const date =
                      new Date(
                        event.played_at,
                      );

                    return (
                      <li
                        key={`${event.played_at}-${event.track.id}`}
                        className="flex items-start gap-4 border-b border-neutral-200 px-5 py-4 last:border-b-0"
                      >
                        {/* Time */}

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

                        {/* Track information */}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold tracking-wide">
                            {
                              event
                                .track
                                .name
                            }
                          </div>

                          <div className="mt-1 truncate text-xs text-neutral-600">
                            {event.track.artists
                              .map(
                                (
                                  artist,
                                ) =>
                                  artist.name,
                              )
                              .join(
                                ", ",
                              )}

                            {" — "}

                            {
                              event
                                .track
                                .album
                                .name
                            }
                          </div>
                        </div>

                        {/* Track icon */}

                        <Music2
                          size={16}
                          strokeWidth={2}
                          className="shrink-0"
                        />
                      </li>
                    );
                  })}
              </ul>

              {recentlyPlayed.length ===
                0 && (
                <div className="px-5 py-6">
                  <EmptyState text="NO_RECENT_STREAM_DATA" />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------
          DATA SUMMARY
      ------------------------------------------------------ */}

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {overviewLoading ? (
          <SummarySkeleton />
        ) : overviewError ? (
          <div className="sm:col-span-3">
            <EmptyState text="ANALYTICS_DATA_UNAVAILABLE" />
          </div>
        ) : (
          <>
            <StatCard
              label="ARTISTS_ANALYZED"
              value={String(
                overview?.artist_count ??
                  0,
              )}
              bg="bg-yellow-300"
              icon={
                <Users
                  size={18}
                  strokeWidth={2}
                />
              }
            />

            <StatCard
              label="TRACKS_ANALYZED"
              value={String(
                overview?.track_count ??
                  0,
              )}
              bg="bg-green-400"
              icon={
                <Music2
                  size={18}
                  strokeWidth={2}
                />
              }
            />

            <StatCard
              label="GENRES_DETECTED"
              value={String(
                overview?.genre_count ??
                  0,
              )}
              bg="bg-black text-white"
              icon={
                <span className="text-lg font-black">
                  #
                </span>
              }
            />
          </>
        )}
      </section>

      {/* ------------------------------------------------------
          DATA RANGE
      ------------------------------------------------------ */}

      <div className="mt-4 flex flex-col gap-1 text-[10px] font-bold tracking-[0.15em] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          DATA_RANGE:{" "}
          {TIME_RANGE_LABELS[
            overview?.time_range ??
              ""
          ] ?? "UNKNOWN"}
        </span>

        <span>
          SOURCE: SPOTIFY_API
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// PANEL HEADER
// ------------------------------------------------------------

function PanelHeader({
  title,
  rightLabel,
  icon,
}: {
  title: string;
  rightLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
      <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
        {title}
      </span>

      {rightLabel && (
        <span className="text-[10px] tracking-widest text-neutral-500">
          {rightLabel}
        </span>
      )}

      {icon &&
        !rightLabel &&
        icon}
    </div>
  );
}

// ------------------------------------------------------------
// PROFILE STAT
// ------------------------------------------------------------

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-2 border-black py-3 text-center">
      <div className="text-[10px] tracking-widest text-neutral-500">
        {label}
      </div>

      <div className="mt-1 font-bold">
        {value}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// SUMMARY STAT CARD
// ------------------------------------------------------------

function StatCard({
  label,
  value,
  bg,
  icon,
}: {
  label: string;
  value: string;
  bg: string;
  icon: React.ReactNode;
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

// ------------------------------------------------------------
// EMPTY STATE
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// DONUT CHART
// ------------------------------------------------------------

interface DonutSlice {
  label: string;
  color: string;
  dash: number;
  gap: number;
  offset: number;
}

interface DonutGenre {
  label: string;
  percent: number;
  color: string;
}

function DonutChart({
  data,
  centerLabel,
}: {
  data: DonutGenre[];
  centerLabel: string;
}) {
  const radius = 60;
  const stroke = 24;

  const circumference =
    2 * Math.PI * radius;

  const slices = React.useMemo<
    DonutSlice[]
  >(() => {
    return data.reduce<
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
  }, [
    data,
    circumference,
  ]);

  return (
    <div className="shrink-0">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label="Genre distribution"
      >
        {/* Background ring */}

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={stroke}
        />

        {/* Genre slices */}

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

        {/* Center value */}

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