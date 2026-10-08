import { useEffect, useState } from "react";

import {
  getAnalyticsArtists,
  getAnalyticsGenres,
  getAnalyticsOverview,
  getAnalyticsTracks,
} from "@/services/analytics";

import type {
  AnalyticsArtist,
  AnalyticsGenre,
  AnalyticsOverview,
} from "@/types/analytics";

export type TimeRange =
  | "short_term"
  | "medium_term"
  | "long_term";

type AnalyticsTracksResponse =
  Awaited<ReturnType<typeof getAnalyticsTracks>>;

export default function useAnalytics() {
  const [timeRange, setTimeRange] =
    useState<TimeRange>("medium_term");

  const [overview, setOverview] =
    useState<AnalyticsOverview | null>(null);

  const [artists, setArtists] =
    useState<AnalyticsArtist[]>([]);

  const [genres, setGenres] =
    useState<AnalyticsGenre[]>([]);

  const [tracks, setTracks] =
    useState<AnalyticsTracksResponse["tracks"]>([]);

  const [overviewLoading, setOverviewLoading] =
    useState(true);

  const [artistsLoading, setArtistsLoading] =
    useState(true);

  const [genresLoading, setGenresLoading] =
    useState(true);

  const [tracksLoading, setTracksLoading] =
    useState(true);

  const [overviewError, setOverviewError] =
    useState(false);

  const [artistsError, setArtistsError] =
    useState(false);

  const [genresError, setGenresError] =
    useState(false);

  const [tracksError, setTracksError] =
    useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setOverviewLoading(true);
        setOverviewError(false);

        const data =
          await getAnalyticsOverview(timeRange);

        setOverview(data);
      } catch (error) {
        console.error(
          "Failed to load analytics overview:",
          error,
        );

        setOverviewError(true);
      } finally {
        setOverviewLoading(false);
      }
    };

    loadOverview();
  }, [timeRange]);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setArtistsLoading(true);
        setArtistsError(false);

        const data =
          await getAnalyticsArtists(
            timeRange,
            20,
          );

        setArtists(data.artists);
      } catch (error) {
        console.error(
          "Failed to load analytics artists:",
          error,
        );

        setArtistsError(true);
      } finally {
        setArtistsLoading(false);
      }
    };

    loadArtists();
  }, [timeRange]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setGenresLoading(true);
        setGenresError(false);

        const data =
          await getAnalyticsGenres(
            timeRange,
            20,
          );

        setGenres(data.genres);
      } catch (error) {
        console.error(
          "Failed to load analytics genres:",
          error,
        );

        setGenresError(true);
      } finally {
        setGenresLoading(false);
      }
    };

    loadGenres();
  }, [timeRange]);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setTracksLoading(true);
        setTracksError(false);

        const data =
          await getAnalyticsTracks(
            timeRange,
            20,
          );

        setTracks(data.tracks);
      } catch (error) {
        console.error(
          "Failed to load analytics tracks:",
          error,
        );

        setTracksError(true);
      } finally {
        setTracksLoading(false);
      }
    };

    loadTracks();
  }, [timeRange]);

  return {
    timeRange,
    setTimeRange,

    overview,
    artists,
    tracks,
    genres,

    loading: {
      overview: overviewLoading,
      artists: artistsLoading,
      tracks: tracksLoading,
      genres: genresLoading,
    },

    error: {
      overview: overviewError,
      artists: artistsError,
      tracks: tracksError,
      genres: genresError,
    },
  };
}