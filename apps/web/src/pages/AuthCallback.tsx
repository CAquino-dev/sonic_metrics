import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const TOKEN_KEY = "sonic_metrics_token";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    navigate("/dashboard", { replace: true });
  }, [navigate, searchParams]);

  return (
    <main>
      <p>Completing Spotify login...</p>
    </main>
  );
}