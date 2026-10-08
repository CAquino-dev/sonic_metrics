export type TimeRange =
  | "short_term"
  | "medium_term"
  | "long_term";

export const TIME_RANGE_LABELS: Record<
  TimeRange,
  string
> = {
  short_term: "LAST 4 WEEKS",
  medium_term: "LAST 6 MONTHS",
  long_term: "ALL TIME",
};

interface DashboardTimeRangeProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const TIME_RANGES: {
  value: TimeRange;
  label: string;
}[] = [
  {
    value: "short_term",
    label: "LAST 4 WEEKS",
  },
  {
    value: "medium_term",
    label: "LAST 6 MONTHS",
  },
  {
    value: "long_term",
    label: "ALL TIME",
  },
];

export default function DashboardTimeRange({
  value,
  onChange,
}: DashboardTimeRangeProps) {
  return (
    <section className="mt-6 border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="border-b-2 border-black px-4 py-3">
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">
          TIME_RANGE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3">
        {TIME_RANGES.map((range, index) => {
          const active = value === range.value;

          return (
            <button
              key={range.value}
              type="button"
              onClick={() => onChange(range.value)}
              className={[
                "px-4 py-4 text-left text-xs font-black tracking-[0.12em]",
                "transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset",
                index > 0
                  ? "border-t-2 border-black sm:border-l-2 sm:border-t-0"
                  : "",
                active
                  ? "bg-green-400 text-black"
                  : "bg-white text-neutral-500 hover:bg-neutral-100 hover:text-black",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{range.label}</span>

                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 border-2 border-black",
                    active ? "bg-black" : "bg-white",
                  ].join(" ")}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}