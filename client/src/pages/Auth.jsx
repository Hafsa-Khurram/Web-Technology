import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Brand } from "../components/Navbar";
import { useAuth, homeFor } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTitle } from "../hooks";

function AuthShell({ children, title, text }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <div style={{ color: "#fff" }}>
          <Brand />
        </div>
        <div>
          <h2>{title}</h2>
          <p className="hide-sm" style={{ maxWidth: "40ch", opacity: 0.88 }}>{text}</p>
        </div>
      </div>
      <div className="auth-form">{children}</div>
    </div>
  );
}

function Password({ id, value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id}
        className="input"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={6}
        required
        style={{ paddingRight: 44 }}
      />
      <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}

const DEMO = [
  ["Customer", "customer@gotravel.com", "customer123"],
  ["Agent", "agent@gotravel.com", "agent123"],
  ["Admin", "admin@gotravel.com", "admin123"],
];

export function Login() {
  useTitle("Log in");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(location.state?.from || homeFor(user), { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Your next trip is a few clicks away." text="Log in to book packages, track your bookings and leave reviews for trips you've taken.">
      <form onSubmit={submit}>
        <h1 style={{ fontSize: "2rem" }}>Log in</h1>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
        {err && <div className="form-error">{err}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn btn-block" disabled={busy} style={{ marginTop: 6 }}>
          {busy ? "Logging in..." : "Log in"}
        </button>
        <div className="demo-box">
          <strong>Demo accounts</strong> (after running the seed script)
          {DEMO.map(([role, em, pw]) => (
            <div key={role}>
              <button type="button" onClick={() => { setEmail(em); setPassword(pw); }}>
                Use {role.toLowerCase()} account
              </button>{" "}
              <span className="muted">{em}</span>
            </div>
          ))}
        </div>
        <p className="center small" style={{ marginTop: 18 }}>
          <Link to="/">Back to home</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  useTitle("Sign up");
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) return setErr("Passwords don't match");
    if (!agree) return setErr("Please accept the terms and conditions");
    setBusy(true);
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast(`Account created. Welcome, ${user.name.split(" ")[0]}!`);
      navigate("/packages", { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="See the world without the planning stress." text="Create a free account to book trips, get booking updates and keep all your invoices in one place.">
      <form onSubmit={submit}>
        <h1 style={{ fontSize: "2rem" }}>Create account</h1>
        <p className="muted">
          Already have one? <Link to="/login">Log in</Link>
        </p>
        {err && <div className="form-error">{err}</div>}
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" className="input" value={form.name} onChange={set("name")} autoComplete="name" required />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" className="input" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="password">Password</label>
            <Password id="password" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="6+ characters" />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <Password id="confirm" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </div>
        </div>
        <label className="row small" style={{ gap: 8, marginBottom: 16 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the terms and conditions
        </label>
        <button className="btn btn-sun btn-block" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
