// src/types/analytics.ts

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface AnalyticsArtist {
  rank: number;
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
}

export interface AnalyticsTrackArtist {
  id: string;
  name: string;
}

export interface AnalyticsTrackAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface AnalyticsTrack {
  rank: number;
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  artists: AnalyticsTrackArtist[];
  album: AnalyticsTrackAlbum;
  popularity: number | null;
}

export interface AnalyticsGenre {
  rank: number;
  genre: string;
  artist_count: number;
}

export interface AnalyticsOverviewArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface AnalyticsOverviewTrack {
  id: string;
  name: string;
  artists: AnalyticsTrackArtist[];
  album: AnalyticsTrackAlbum;
}

export interface AnalyticsOverviewGenre {
  genre: string;
  artist_count: number;
}

export interface AnalyticsOverview {
  time_range: string;

  top_artist: AnalyticsOverviewArtist;

  top_track: AnalyticsOverviewTrack;

  top_genre: AnalyticsOverviewGenre;

  artist_count: number;
  track_count: number;
  genre_count: number;
}

export interface AnalyticsArtistsResponse {
  time_range: string;
  limit: number;
  total_artists: number;
  artists: AnalyticsArtist[];
}

export interface AnalyticsTracksResponse {
  time_range: string;
  limit: number;
  total_tracks: number;
  tracks: AnalyticsTrack[];
}

export interface AnalyticsGenresResponse {
  time_range: string;
  artist_limit: number;
  total_genres: number;
  genres: AnalyticsGenre[];
}