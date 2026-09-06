import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import Artists from "../pages/Artists";
import Tracks from "../pages/Tracks";
import RecentlyPlayed from "../pages/RecentlyPlayed";
import NowPlaying from "../pages/NowPlaying";
import Settings from "../pages/Settings";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route
              path="/recently-played"
              element={<RecentlyPlayed />}
            />
            <Route
              path="/now-playing"
              element={<NowPlaying />}
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}