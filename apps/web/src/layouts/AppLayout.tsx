import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Analytics",
    path: "/analytics",
  },
  {
    label: "Artists",
    path: "/artists",
  },
  {
    label: "Tracks",
    path: "/tracks",
  },
  {
    label: "Recently Played",
    path: "/recently-played",
  },
  {
    label: "Now Playing",
    path: "/now-playing",
  },
  {
    label: "Settings",
    path: "/settings",
  },
];

export default function AppLayout() {
  return (
    <div>
      <aside>
        <div>
          <h1>Sonic Metrics</h1>
        </div>

        <nav>
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}