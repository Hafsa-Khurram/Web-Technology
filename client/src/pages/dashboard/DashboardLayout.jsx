import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiPieChart, FiBriefcase, FiMap, FiTag, FiUsers, FiStar, FiMenu, FiLogOut, FiGlobe } from "react-icons/fi";
import { Brand } from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAdmin = user.role === "admin";

  useEffect(() => setOpen(false), [pathname]);

  const items = [
    { to: "/dashboard", label: "Overview", icon: FiPieChart, end: true },
    { to: "/dashboard/bookings", label: "Bookings", icon: FiBriefcase },
    { to: "/dashboard/packages", label: "Packages", icon: FiMap },
    { to: "/dashboard/discounts", label: "Discounts", icon: FiTag },
    { to: "/dashboard/users", label: isAdmin ? "Users" : "Customers", icon: FiUsers },
    { to: "/dashboard/reviews", label: "Reviews", icon: FiStar },
  ];

  return (
    <div className="dash">
      <aside className={`side ${open ? "open" : ""}`}>
        <Brand />
        <nav aria-label="Portal">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon /> {label}
            </NavLink>
          ))}
          <NavLink to="/">
            <FiGlobe /> View website
          </NavLink>
        </nav>
        <div className="role">
          <strong>{user.name}</strong>
          {isAdmin ? "Administrator" : "Travel agent"}
          <button
            className="btn btn-light btn-sm btn-block"
            style={{ marginTop: 12 }}
            onClick={() => {
              navigate("/", { replace: true });
              logout();
            }}
          >
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>
      {open && <div className="overlay" style={{ zIndex: 70 }} onClick={() => setOpen(false)} />}
      <div className="dash-main">
        <button className="icon-btn dash-burger" aria-label="Open menu" onClick={() => setOpen(true)} style={{ marginBottom: 8 }}>
          <FiMenu size={22} />
        </button>
        <Outlet />
      </div>
    </div>
  );
}

export function DashHead({ title, children }) {
  return (
    <div className="dash-top">
      <h1>{title}</h1>
      <span className="spacer" />
      {children}
    </div>
  );
}
