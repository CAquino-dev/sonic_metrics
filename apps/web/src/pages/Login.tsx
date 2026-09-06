import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#f4f2ea] relative overflow-hidden font-mono">
      {/* Graph paper background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000012 1px, transparent 1px), linear-gradient(to bottom, #00000012 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative blocks */}
      <div className="absolute -left-10 bottom-24 w-28 h-14 bg-yellow-300 border-2 border-black -rotate-3" />

      <div className="absolute -right-10 top-14 w-24 h-28 bg-green-800 border-2 border-black rotate-6" />

      {/* Top navigation */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b-2 border-black">
        <span className="text-xl font-black italic tracking-tight">
          SONIC_METRICS
        </span>

        <nav className="hidden sm:flex items-center gap-8 text-xs tracking-widest text-neutral-400">
          <span>DASHBOARD</span>
          <span>TRENDS</span>
          <span>AI INSIGHTS</span>
        </nav>

        <div className="border-2 border-black rounded-md p-1.5">
          <LockIcon />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex justify-center px-4 py-16">
        <div className="w-full max-w-xl bg-[#faf9f4] border-2 border-black shadow-[6px_6px_0_0_#000]">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 bg-black text-white text-[11px] tracking-widest px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />

            SECURE_TERMINAL_v2.4.0 // AUTH_REQUIRED_
          </div>

          {/* Card content */}
          <div className="px-8 sm:px-10 py-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              SYNC YOUR
            </h1>

            <h2 className="inline-block bg-green-800 text-white text-3xl sm:text-4xl font-black px-3 py-1 mt-1 -rotate-1">
              DATA_STREAM
            </h2>

            <p className="mt-6 text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Connect your Spotify account to unlock deep analytical
              insights, playback trends, and listening metrics.
            </p>

            {/* Spotify login */}
            <button
              type="button"
              onClick={login}
              className="mt-8 w-full flex items-center justify-center gap-3 bg-green-400 hover:bg-green-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black shadow-[4px_4px_0_0_#000] transition-all font-bold text-black text-base py-4"
            >
              <AudioWaveIcon />

              CONNECT WITH SPOTIFY

              <span aria-hidden="true">&rarr;</span>
            </button>

            {/* Security information */}
            <div className="mt-8 grid grid-cols-2 gap-3 text-left">
              <StatBox
                label="PERMISSION_LEVEL"
                value="READ_ONLY"
              />

              <StatBox
                label="DATA_ENCRYPTION"
                value="AES_256_STABLE"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 bg-black text-neutral-400 text-[11px] tracking-widest px-6 py-3">
        <span>v2.4.0_STABLE</span>

        <span className="text-center">
          DISCLAIMER: SONIC_METRICS IS NOT AFFILIATED WITH SPOTIFY AB.
        </span>

        <div className="flex gap-4 text-blue-400">
          <span>PRIVACY_TERMINAL</span>
          <span>SOURCE</span>
          <span>API_ATTRIBUTION</span>
        </div>
      </footer>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="border-2 border-black px-3 py-2 bg-[#f4f2ea]">
      <div className="text-[10px] tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="text-sm font-bold">
        {value}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="11"
        width="16"
        height="9"
        rx="1"
      />

      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function AudioWaveIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 10v4" />
      <path d="M8 6v12" />
      <path d="M12 3v18" />
      <path d="M16 6v12" />
      <path d="M20 10v4" />
    </svg>
  );
}
