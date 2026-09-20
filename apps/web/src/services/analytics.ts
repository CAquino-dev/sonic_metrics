// src/services/analytics.ts

import { api } from "./api";

import type {
  AnalyticsOverview,
  AnalyticsArtistsResponse,
  AnalyticsTracksResponse,
  AnalyticsGenresResponse,
} from "../types/analytics";

export async function getAnalyticsOverview(
  timeRange: string = "medium_term",
): Promise<AnalyticsOverview> {
  const response = await api.get<AnalyticsOverview>(
    "/analytics/overview",
    {
      params: {
        time_range: timeRange,
      },
    },
  );

  return response.data;
}

export async function getAnalyticsArtists(
  timeRange: string = "medium_term",
  limit: number = 20,
): Promise<AnalyticsArtistsResponse> {
  const response = await api.get<AnalyticsArtistsResponse>(
    "/analytics/artists",
    {
      params: {
        time_range: timeRange,
        limit,
      },
    },
  );

  return response.data;
}

export async function getAnalyticsTracks(
  timeRange: string = "medium_term",
  limit: number = 20,
): Promise<AnalyticsTracksResponse> {
  const response = await api.get<AnalyticsTracksResponse>(
    "/analytics/tracks",
    {
      params: {
        time_range: timeRange,
        limit,
      },
    },
  );

  return response.data;
}

export async function getAnalyticsGenres(
  timeRange: string = "medium_term",
  artistLimit: number = 20,
): Promise<AnalyticsGenresResponse> {
  const response = await api.get<AnalyticsGenresResponse>(
    "/analytics/genres",
    {
      params: {
        time_range: timeRange,
        artist_limit: artistLimit,
      },
    },
  );

  return response.data;
}