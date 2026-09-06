// FILE: apps/web/src/layouts/AppLayout.tsx

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navigation = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Analytics", path: "/analytics" },
  { label: "Artists", path: "/artists" },
  { label: "Tracks", path: "/tracks" },
  { label: "Recently Played", path: "/recently-played" },
  { label: "Now Playing", path: "/now-playing" },
  { label: "Settings", path: "/settings" },
];

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f2ea] text-black font-mono">
      {/* Graph paper background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000012 1px, transparent 1px), linear-gradient(to bottom, #00000012 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r-2 border-black bg-[#faf9f4]">
          {/* Logo */}
          <div className="border-b-2 border-black px-6 py-6">
            <div className="text-xl font-black italic tracking-tight">
              SONIC_METRICS
            </div>

            <div className="mt-2 text-[10px] tracking-[0.2em] text-neutral-400">
              ANALYTICS_TERMINAL
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="mb-3 px-2 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
              NAVIGATION_
            </div>

            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between border-2 px-3 py-3 text-xs font-bold tracking-wider transition-all",
                      isActive
                        ? "bg-green-400 border-black shadow-[3px_3px_0_0_#000] translate-x-[-1px]"
                        : "border-transparent hover:border-black hover:bg-yellow-300",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label.toUpperCase()}</span>

                      {isActive && (
                        <span className="text-black">
                          →
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="border-t-2 border-black">
            {/* System status */}
            <div className="px-6 py-4">
              <div className="text-[10px] tracking-widest text-neutral-400">
                SYSTEM_STATUS
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-green-500 border border-black" />
                ONLINE
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="w-full border-t-2 border-black px-6 py-4 text-left text-xs font-bold tracking-wider hover:bg-red-400 transition-colors"
            >
              DISCONNECT_SPOTIFY →
            </button>
          </div>
        </aside>

        {/* Main area */}
        <main className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="flex items-center justify-between border-b-2 border-black bg-[#faf9f4] px-5 py-4 md:hidden">
            <div>
              <div className="text-lg font-black italic">
                SONIC_METRICS
              </div>

              <div className="text-[9px] tracking-widest text-neutral-400">
                ANALYTICS_TERMINAL
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="border-2 border-black px-3 py-2 text-[10px] font-bold hover:bg-red-400 transition-colors"
            >
              EXIT
            </button>
          </header>

          {/* Page content */}
          <div className="p-5 sm:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}