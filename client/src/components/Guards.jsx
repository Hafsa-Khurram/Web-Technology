import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./ui";

// Only lets logged-in users (optionally with specific roles) through
export function RequireAuth({ roles, children }) {
  const { user, loading, loggedOut } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user && loggedOut) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Login/sign-up pages: send away users who were ALREADY logged in when they opened the page.
// Users who log in on this page are redirected by the page itself (e.g. back to the package they were booking).
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  // Captured once, as soon as the saved session (if any) has finished loading
  const [wasLoggedIn, setWasLoggedIn] = useState(loading ? null : Boolean(user));
  if (wasLoggedIn === null && !loading) setWasLoggedIn(Boolean(user));
  if (loading || wasLoggedIn === null) return <Loader />;
  if (user && wasLoggedIn) return <Navigate to={user.role === "customer" ? "/my-bookings" : "/dashboard"} replace />;
  return children;
}
