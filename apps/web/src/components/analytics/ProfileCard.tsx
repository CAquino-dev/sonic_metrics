import { Settings } from "lucide-react";

import type { SpotifyUser } from "@/types/spotify";

import { ProfileSkeleton } from "@/components/analytics/DashboardSkeletons";

interface ProfileCardProps {
  profile: SpotifyUser | null;
  loading: boolean;
  error: boolean;
}

export default function ProfileCard({
  profile,
  loading,
  error,
}: ProfileCardProps) {
  return (
    <section className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
          PROFILE_IDENTITY
        </span>

        <Settings
          size={18}
          strokeWidth={2}
        />
      </div>

      <div className="p-5">
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <EmptyState text="PROFILE_DATA_UNAVAILABLE" />
        ) : (
          <>
            <div className="aspect-[4/3] w-full overflow-hidden border-2 border-black bg-neutral-800">
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

            <h2 className="mt-5 text-3xl font-black">
              {profile?.display_name ??
                "UNKNOWN_USER"}
            </h2>

            <p className="mt-1 text-xs tracking-widest text-neutral-600">
              SPOTIFY_ACCOUNT :{" "}
              {profile?.spotify_product?.toLocaleUpperCase() ??
                "UNKNOWN"}
            </p>

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
  );
}

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