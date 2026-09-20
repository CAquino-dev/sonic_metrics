// apps/web/src/types/spotify.ts

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string | null;
  spotify_product? : string | null;

  photo?: string | null;

  country?: string | null;

  followers?: {
    total: number;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;

  images: SpotifyImage[];

  genres?: string[];

  popularity?: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;

  artists: {
    id: string;
    name: string;
  }[];

  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
}

export interface RecentlyPlayedTrack {
  played_at: string;
  track: SpotifyTrack;
}

export interface RecentlyPlayedResponse {
  limit: number;
  items: RecentlyPlayedTrack[];
}

export interface SpotifyPlayerState {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyTrack | null;

  device?: {
    id: string | null;
    name: string;
    type: string;
    volume_percent: number | null;
  } | null;
}