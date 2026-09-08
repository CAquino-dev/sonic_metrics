// apps/web/src/layouts/AppLayout.tsx

import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Music2,
  Play,
  Settings,
  Users,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Artists",
    path: "/artists",
    icon: Users,
  },
  {
    label: "Tracks",
    path: "/tracks",
    icon: Music2,
  },
  {
    label: "Recently Played",
    path: "/recently-played",
    icon: History,
  },
  {
    label: "Now Playing",
    path: "/now-playing",
    icon: Play,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f2ea] font-mono text-black">
      {/* =========================================================
          GRAPH PAPER BACKGROUND
      ========================================================= */}

      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000012 1px, transparent 1px), linear-gradient(to bottom, #00000012 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* =========================================================
          APP SHELL
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen">
        {/* =======================================================
            SIDEBAR
        ======================================================= */}

        <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-black bg-[#faf9f4] lg:flex">
          {/* Logo */}

          <div className="border-b-2 border-black px-6 py-6">
            <div className="text-xl font-black italic tracking-tight">
              SONIC_METRICS
            </div>

            <div className="mt-2 text-[10px] tracking-[0.2em] text-neutral-500">
              ANALYTICS_TERMINAL
            </div>
          </div>

          {/* Navigation */}

          <nav className="flex-1 px-4 py-6">
            <div className="mb-4 px-2 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
              NAVIGATION_
            </div>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 border-2 px-3 py-3",
                        "text-xs font-bold tracking-widest",
                        "transition-all",

                        isActive
                          ? [
                              "border-black",
                              "bg-green-400",
                              "shadow-[3px_3px_0_0_#000]",
                              "translate-x-[-1px]",
                            ].join(" ")
                          : [
                              "border-transparent",
                              "hover:border-black",
                              "hover:bg-yellow-300",
                            ].join(" "),
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          strokeWidth={2}
                          aria-hidden="true"
                        />

                        <span className="flex-1">
                          {item.label.toUpperCase()}
                        </span>

                        {isActive && (
                          <span className="font-black">
                            →
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* System information */}

          <div className="border-t-2 border-black">
            <div className="px-6 py-5">
              <div className="text-[10px] tracking-[0.2em] text-neutral-400">
                SYSTEM_STATUS
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-black bg-green-400" />
                API_ONLINE
              </div>

              <div className="mt-1 text-[10px] text-neutral-500">
                CONNECTION_STABLE
              </div>
            </div>

            {/* Logout */}

            <button
              type="button"
              onClick={logout}
              className={[
                "w-full",
                "border-t-2 border-black",
                "px-6 py-4",
                "text-left",
                "text-xs font-bold tracking-widest",
                "transition-colors",
                "hover:bg-red-400",
              ].join(" ")}
            >
              DISCONNECT_SPOTIFY →
            </button>
          </div>
        </aside>

        {/* =======================================================
            MAIN CONTENT
        ======================================================= */}

        <main className="min-w-0 flex-1">
          {/* =====================================================
              MOBILE / TABLET HEADER
          ===================================================== */}

          <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-black bg-[#faf9f4] px-5 py-4 lg:hidden">
            <div>
              <div className="text-lg font-black italic tracking-tight">
                SONIC_METRICS
              </div>

              <div className="mt-1 text-[9px] tracking-[0.2em] text-neutral-400">
                ANALYTICS_TERMINAL
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className={[
                "border-2 border-black",
                "px-3 py-2",
                "text-[10px] font-bold tracking-widest",
                "transition-colors",
                "hover:bg-red-400",
              ].join(" ")}
            >
              EXIT
            </button>
          </header>

          {/* =====================================================
              DESKTOP TOP BAR
          ===================================================== */}

          <div className="hidden items-center justify-between border-b-2 border-black bg-[#faf9f4] px-8 py-4 lg:flex">
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                SONIC_METRICS
              </span>

              <span className="mx-2 text-[10px] text-neutral-400">
                /
              </span>

              <span className="text-[10px] font-bold tracking-[0.2em]">
                DATA_TERMINAL
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
              <span className="h-2 w-2 rounded-full border border-black bg-green-400" />
              LIVE
            </div>
          </div>

          {/* =====================================================
              PAGE CONTENT
          ===================================================== */}

          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}