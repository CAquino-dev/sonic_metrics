import { api } from "../services/api";

import type {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack,
  RecentlyPlayedResponse,
  SpotifyPlayerState,
} from "../types/spotify";


export async function getMe(): Promise<SpotifyUser> {
  const response =
    await api.get<SpotifyUser>(
      "/spotify/me",
    );

  return response.data;
}


export async function getTopArtists(): Promise<
  SpotifyArtist[]
> {
  const response =
    await api.get<SpotifyArtist[]>(
      "/spotify/top-artists",
    );

  return response.data;
}


export async function getTopTracks(): Promise<
  SpotifyTrack[]
> {
  const response =
    await api.get<SpotifyTrack[]>(
      "/spotify/top-tracks",
    );

  return response.data;
}


export async function getRecentlyPlayed(): Promise<
  RecentlyPlayedResponse
> {
  const response =
    await api.get<RecentlyPlayedResponse>(
      "/spotify/recently-played",
    );

  return response.data;
}


export async function getPlayer(): Promise<
  SpotifyPlayerState | null
> {
  const response =
    await api.get<SpotifyPlayerState | null>(
      "/spotify/player",
    );

  return response.data;
}


export async function getSpotifyGenres(): Promise<
  string[]
> {
  const response =
    await api.get<string[]>(
      "/spotify/genres",
    );

  return response.data;
}