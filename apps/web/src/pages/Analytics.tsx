import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsTimeRange from "@/components/analytics/AnalyticsTimeRange";
import AnalyticsSummary from "@/components/analytics/AnalyticsSummary";
import AnalyticsArtists from "@/components/analytics/AnalyticsArtists";
import AnalyticsGenres from "@/components/analytics/AnalyticsGenres";
import AnalyticsTracks from "@/components/analytics/AnalyticsTracks";
import useAnalytics from "@/hooks/useAnalytics";

export default function Analytics() {
  const {
    timeRange,
    setTimeRange,
    overview,
    artists,
    tracks,
    genres,
    loading,
    error,
  } = useAnalytics();

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticsHeader />

        <AnalyticsTimeRange
          value={timeRange}
          onChange={setTimeRange}
        />

        <AnalyticsSummary
          overview={overview}
          loading={loading.overview}
          error={error.overview}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <AnalyticsArtists
            artists={artists}
            loading={loading.artists}
            error={error.artists}
          />

          <AnalyticsGenres
            genres={genres}
            loading={loading.genres}
            error={error.genres}
          />
        </div>

        <div className="mt-6">
          <AnalyticsTracks
            tracks={tracks}
            loading={loading.tracks}
            error={error.tracks}
          />
        </div>
      </div>
    </main>
  );
}