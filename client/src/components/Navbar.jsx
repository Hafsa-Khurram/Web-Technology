import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiMenu, FiX, FiLogOut, FiUser, FiBriefcase, FiGrid } from "react-icons/fi";
import { MdFlight } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <MdFlight size={20} style={{ transform: "rotate(45deg)" }} />
      </span>
      GoTravel
    </Link>
  );
}

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/packages", label: "Packages" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ overHero = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    api("/notifications")
      .then((d) => setUnread(d.unread))
      .catch(() => {});
  }, [user, pathname]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const doLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <header className={`nav ${overHero ? "nav-over" : ""}`}>
      <div className="wrap nav-inner">
        <Brand />
        <ul className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/notifications" className="icon-btn bell" aria-label={`Notifications (${unread} unread)`}>
                <FiBell size={20} />
                {unread > 0 && <span className="dot">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <div className="menu" ref={menuRef}>
                <button className="avatar" aria-label="Account menu" onClick={() => setMenu((m) => !m)}>
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {menu && (
                  <div className="menu-pop">
                    <div className="who">
                      <strong>{user.name}</strong>
                      <div className="muted small">{user.email}</div>
                    </div>
                    {user.role !== "customer" && (
                      <Link to="/dashboard">
                        <FiGrid /> {user.role === "admin" ? "Admin portal" : "Agent portal"}
                      </Link>
                    )}
                    <Link to="/my-bookings">
                      <FiBriefcase /> My bookings
                    </Link>
                    <Link to="/profile">
                      <FiUser /> Profile
                    </Link>
                    <button onClick={doLogout}>
                      <FiLogOut /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hide-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-sun btn-sm">
                Sign up
              </Link>
            </>
          )}
          <button className="icon-btn burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
