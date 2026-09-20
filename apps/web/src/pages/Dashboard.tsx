import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import ProfileCard from "@/components/analytics/ProfileCard";
import TopArtistsCard from "@/components/analytics/TopArtistsCard";
import GenreSegmentationCard from "@/components/analytics/GenreSegmentationCard";
import RecentlyPlayedCard from "@/components/analytics/RecentlyPlayedCard";
import DashboardSummary from "@/components/analytics/DashboardSummary";

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
         * It represents the relative artist
         * count among the displayed top genres.
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

        {/* PROFILE IDENTITY */}

        <ProfileCard
          profile={profile}
          loading={profileLoading}
          error={profileError}
        />

        {/* TOP ARTISTS */}

        <TopArtistsCard
          artists={artists}
          loading={artistsLoading}
          error={artistsError}
        />

        {/* GENRE SEGMENTATION */}

        <GenreSegmentationCard
          genres={displayedGenres}
          genreCount={
            overview?.genre_count ?? 0
          }
          loading={genresLoading}
          error={genresError}
        />

        {/* STREAM CHRONOLOGY */}

        <RecentlyPlayedCard
          recentlyPlayed={recentlyPlayed}
          loading={recentlyPlayedLoading}
          error={recentlyPlayedError}
        />
      </div>

      {/* ------------------------------------------------------
          DATA SUMMARY
      ------------------------------------------------------ */}

      <DashboardSummary
        overview={overview}
        loading={overviewLoading}
        error={overviewError}
      />

      {/* ------------------------------------------------------
          DATA RANGE
      ------------------------------------------------------ */}

      <div className="mt-4 flex flex-col gap-1 text-[10px] font-bold tracking-[0.15em] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          DATA_RANGE:{" "}
          {TIME_RANGE_LABELS[
            overview?.time_range ?? ""
          ] ?? "UNKNOWN"}
        </span>

        <span>
          SOURCE: SPOTIFY_API
        </span>
      </div>
    </div>
  );
}