// apps/web/src/pages/Dashboard.tsx

import React from "react";
import hiroi from "../assets/hiroi.jpg";

import {
  Gauge,
  History,
  Play,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface ArtistStat {
  name: string;
  percent: number;
}

interface GenreStat {
  label: string;
  percent: number;
  color: string;
}

interface StreamEvent {
  time: string;
  title: string;
  subtitle: string;
}

// ------------------------------------------------------------
// DUMMY DATA
// Replace with API data later.
// ------------------------------------------------------------

const profile = {
  username: "hiroi",
  tag: "PREMIUM_ACCOUNT / ARCHIVE_ACCESS",
  listenTimeMins: 142890,
  followers: "1.2K",
  following: 842,
  avatarUrl: hiroi,
};

const topArtists: ArtistStat[] = [
  { name: "APHEX TWIN", percent: 92 },
  { name: "MODERN ERROR", percent: 78 },
  { name: "BURIAL", percent: 64 },
  { name: "HEALTH", percent: 52 },
  { name: "DEAFHEAVEN", percent: 41 },
];

const genres: GenreStat[] = [
  {
    label: "IDM",
    percent: 50,
    color: "#4ade80",
  },
  {
    label: "GLITCH",
    percent: 25,
    color: "#facc15",
  },
  {
    label: "POST-METAL",
    percent: 25,
    color: "#111111",
  },
];

const streamHistory: StreamEvent[] = [
  {
    time: "14:21",
    title: "XTAL",
    subtitle: "Aphex Twin — Selected Ambient Works",
  },
  {
    time: "13:55",
    title: "ARCHANGEL",
    subtitle: "Burial — Untrue",
  },
  {
    time: "13:48",
    title: "SELF-ABUSER",
    subtitle: "Modern Error — Victim Of A Modern Age",
  },
  {
    time: "13:30",
    title: "MAJOR CITIES",
    subtitle: "HEALTH — RAT WARS",
  },
];

const systemStats = {
  latencyMs: 14,
  dataIntegrity: 99.9,
  apiOnline: true,
};

// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------

export default function Dashboard() {
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
            icon={<Settings size={18} strokeWidth={2} />}
          />

          <div className="p-5">
            {/* Avatar */}

            <div className="aspect-[4/3] w-full overflow-hidden border-2 border-black bg-neutral-800">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
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
              {profile.username}
            </h2>

            <p className="mt-1 text-xs tracking-widest text-neutral-600">
              {profile.tag}
            </p>

            {/* Listening time */}

            <div className="mt-5 bg-black px-4 py-3 text-xs font-bold tracking-widest text-white">
              LISTEN_TIME:{" "}
              {profile.listenTimeMins.toLocaleString()}{" "}
              MINS
            </div>

            {/* Followers / Following */}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <ProfileStat
                label="FOLLOWERS"
                value={profile.followers}
              />

              <ProfileStat
                label="FOLLOWING"
                value={profile.following.toLocaleString()}
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            TOP ARTISTS
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="TOP_ARTISTS_DENSITY"
            rightLabel="PERIOD: L30D"
          />

          <div className="flex flex-col gap-5 p-5">
            {topArtists.map((artist, index) => (
              <div key={artist.name}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-[10px] font-bold text-neutral-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="truncate text-sm font-bold">
                      {artist.name}
                    </span>
                  </div>

                  <span className="shrink-0 text-sm font-black">
                    {artist.percent}%
                  </span>
                </div>

                <div className="h-7 border-2 border-black bg-white">
                  <div
                    className="h-full bg-green-400 transition-all"
                    style={{
                      width: `${artist.percent}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================
            GENRE SEGMENTATION
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader title="GENRE_SEGMENTATION" />

          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:items-center">
            <DonutChart
              data={genres}
              centerLabel="8"
            />

            <div className="w-full flex-1">
              <div className="mb-4 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                DETECTED_GENRES_
              </div>

              <ul className="flex flex-col gap-3 text-sm font-bold">
                {genres.map((genre) => (
                  <li
                    key={genre.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 shrink-0 border-2 border-black"
                        style={{
                          backgroundColor: genre.color,
                        }}
                      />

                      <span>{genre.label}</span>
                    </div>

                    <span>{genre.percent}%</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-l-4 border-black pl-3 text-xs italic leading-relaxed text-neutral-600">
                "High frequency of abstract patterns detected in current
                stream cycle."
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            STREAM CHRONOLOGY
        ==================================================== */}

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <PanelHeader
            title="STREAM_CHRONOLOGY"
            icon={<History size={16} strokeWidth={2} />}
          />

          <ul>
            {streamHistory.map((event) => (
              <li
                key={`${event.time}-${event.title}`}
                className="flex items-start gap-4 border-b border-neutral-200 px-5 py-4 last:border-b-0"
              >
                {/* Time */}

                <span className="w-12 shrink-0 pt-0.5 text-sm text-neutral-500">
                  {event.time}
                </span>

                {/* Track information */}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold tracking-wide">
                    {event.title}
                  </div>

                  <div className="mt-1 truncate text-xs text-neutral-600">
                    {event.subtitle}
                  </div>
                </div>

                {/* Play */}

                <button
                  type="button"
                  className="shrink-0 border-2 border-black p-1.5 transition-colors hover:bg-green-400"
                  aria-label={`Play ${event.title}`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t-2 border-black px-5 py-3 text-center">
            <button
              type="button"
              className="text-xs font-bold tracking-widest underline underline-offset-4 hover:bg-yellow-300"
            >
              LOAD_OLDER_DATA
            </button>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------
          SYSTEM STAT STRIP
      ------------------------------------------------------ */}

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="SYSTEM_LATENCY"
          value={`${systemStats.latencyMs}MS`}
          bg="bg-yellow-300"
          icon={<Gauge size={18} strokeWidth={2} />}
        />

        <StatCard
          label="DATA_INTEGRITY"
          value={`${systemStats.dataIntegrity}%`}
          bg="bg-green-400"
          icon={<ShieldCheck size={18} strokeWidth={2} />}
        />

        <StatCard
          label="API_UPTIME"
          value={systemStats.apiOnline ? "ONLINE" : "OFFLINE"}
          bg="bg-black text-white"
          icon={
            <span className="h-2.5 w-2.5 rounded-full border border-black bg-green-400" />
          }
        />
      </section>
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

      {icon && !rightLabel && icon}
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
// SYSTEM STAT CARD
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
// DONUT CHART
// ------------------------------------------------------------

interface DonutSlice {
  label: string;
  color: string;
  dash: number;
  gap: number;
  offset: number;
}

function DonutChart({
  data,
  centerLabel,
}: {
  data: GenreStat[];
  centerLabel: string;
}) {
  const radius = 60;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;

  const slices = React.useMemo<DonutSlice[]>(() => {
    return data.reduce<DonutSlice[]>((acc, slice) => {
      const dash =
        (slice.percent / 100) * circumference;

      const gap = circumference - dash;

      const previousOffset =
        acc.length > 0
          ? acc[acc.length - 1].offset +
            acc[acc.length - 1].dash
          : 0;

      acc.push({
        label: slice.label,
        color: slice.color,
        dash,
        gap,
        offset: previousOffset,
      });

      return acc;
    }, []);
  }, [data, circumference]);

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
          {slices.map((slice) => (
            <circle
              key={slice.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={`${slice.dash} ${slice.gap}`}
              strokeDashoffset={-slice.offset}
            />
          ))}
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