import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiTag, FiMessageSquare } from "react-icons/fi";
import { Loader, Stars, Empty } from "../components/ui";
import { api, fmtDate, money } from "../api";
import { useApi, useTitle } from "../hooks";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function PackageDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/packages/${id}`);
  const pkg = data?.package;
  useTitle(pkg?.title || "Package");

  if (loading) return <div style={{ paddingTop: 120 }}><Loader /></div>;
  if (error)
    return (
      <div className="wrap section" style={{ paddingTop: 140 }}>
        <Empty icon={FiMapPin} title="We couldn't find that package" action={<Link to="/packages" className="btn">Browse packages</Link>}>
          {error}
        </Empty>
      </div>
    );

  return (
    <>
      <section className="detail-hero" style={{ backgroundImage: `url(${pkg.image})` }}>
        <div className="wrap">
          <p className="small" style={{ margin: "0 0 8px", opacity: 0.85 }}>
            <Link to="/packages" style={{ color: "#fff" }}>Packages</Link> / {pkg.category}
          </p>
          <h1 style={{ marginBottom: 12 }}>{pkg.title}</h1>
          <div className="meta">
            <span><FiMapPin /> {pkg.destination}, {pkg.country}</span>
            <span><FiCalendar /> {pkg.durationDays} days</span>
            {pkg.ratingCount > 0 && (
              <span>
                <Stars value={pkg.ratingAvg} /> {pkg.ratingAvg.toFixed(1)} ({pkg.ratingCount} review{pkg.ratingCount > 1 ? "s" : ""})
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="wrap detail-layout">
        <div className="stack" style={{ paddingTop: 30 }}>
          <div className="panel">
            <h2 style={{ fontSize: "1.5rem" }}>About this trip</h2>
            <p style={{ maxWidth: "70ch" }}>{pkg.description}</p>
            {pkg.highlights?.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>What's included</h3>
                <ul className="highlights">
                  {pkg.highlights.map((h) => (
                    <li key={h}><FiCheck /> {h}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="panel">
            <div className="panel-title">
              <h3>Traveller reviews</h3>
              {pkg.ratingCount > 0 && <span className="muted small">{pkg.ratingAvg.toFixed(1)} out of 5</span>}
            </div>
            {data.reviews.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                <FiMessageSquare style={{ verticalAlign: "-2px" }} /> No reviews yet. Travellers can review this trip after it ends.
              </p>
            ) : (
              <div className="stack">
                {data.reviews.map((r) => (
                  <div key={r._id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
                    <div className="row">
                      <strong>{r.user?.name || "Traveller"}</strong>
                      <Stars value={r.rating} />
                      <span className="spacer" />
                      <span className="muted small">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.comment && <p style={{ margin: "6px 0 0" }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <BookingBox pkg={pkg} />
      </div>
    </>
  );
}

function BookingBox({ pkg }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ travelDate: "", travelers: 2, contactPhone: user?.phone || "", notes: "" });
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const subtotal = pkg.price * Number(form.travelers || 0);
    const discount = coupon ? (subtotal * coupon.percent) / 100 : 0;
    return { subtotal, discount, total: subtotal - discount };
  }, [pkg.price, form.travelers, coupon]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyCode = async () => {
    setErr("");
    if (!user) return navigate("/login", { state: { from: `/packages/${pkg._id}` } });
    try {
      const c = await api("/bookings/validate-coupon", { method: "POST", body: { code } });
      setCoupon(c);
      toast(`${c.code} applied: ${c.percent}% off`);
    } catch (e) {
      setCoupon(null);
      setErr(e.message);
    }
  };

  const book = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: `/packages/${pkg._id}` } });
    setErr("");
    setBusy(true);
    try {
      const d = await api("/bookings", {
        method: "POST",
        body: { ...form, packageId: pkg._id, couponCode: coupon?.code },
      });
      toast(`Booking ${d.booking.bookingRef} received. We'll confirm it soon.`);
      navigate("/my-bookings", { state: { highlight: d.booking._id } });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="panel book-box">
      <div className="row" style={{ marginBottom: 14 }}>
        <span className="price">{money(pkg.price)}<small>per person</small></span>
      </div>
      {err && <div className="form-error">{err}</div>}
      <form onSubmit={book}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="travelDate"><FiCalendar style={{ verticalAlign: "-2px" }} /> Travel date</label>
            <input id="travelDate" type="date" className="input" min={minDate()} value={form.travelDate} onChange={set("travelDate")} required />
          </div>
          <div className="field">
            <label htmlFor="travelers"><FiUsers style={{ verticalAlign: "-2px" }} /> Travellers</label>
            <input id="travelers" type="number" className="input" min={1} max={20} value={form.travelers} onChange={set("travelers")} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="phone">Contact phone</label>
          <input id="phone" className="input" value={form.contactPhone} onChange={set("contactPhone")} placeholder="+92 3xx xxxxxxx" />
        </div>
        <div className="field">
          <label htmlFor="notes">Requests (optional)</label>
          <textarea id="notes" className="textarea" style={{ minHeight: 70 }} value={form.notes} onChange={set("notes")} placeholder="Dietary needs, room preferences..." />
        </div>
        <div className="field">
          <label htmlFor="code"><FiTag style={{ verticalAlign: "-2px" }} /> Promo code</label>
          <div className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
            <input id="code" className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
            <button type="button" className="btn btn-ghost" onClick={applyCode} disabled={!code}>Apply</button>
          </div>
        </div>

        <div style={{ margin: "6px 0 16px" }}>
          <div className="summary-line">
            <span>{money(pkg.price)} × {form.travelers || 0}</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          {coupon && (
            <div className="summary-line discount">
              <span>{coupon.code} ({coupon.percent}% off)</span>
              <span>−{money(totals.discount)}</span>
            </div>
          )}
          <div className="summary-line total">
            <span>Total</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>

        {user ? (
          <button className="btn btn-sun btn-block" disabled={busy}>
            {busy ? "Booking..." : "Book this trip"}
          </button>
        ) : (
          <button type="button" className="btn btn-sun btn-block" onClick={() => navigate("/login", { state: { from: `/packages/${pkg._id}` } })}>
            Log in to book
          </button>
        )}
        <p className="muted small center" style={{ margin: "10px 0 0" }}>
          No payment now. An agent confirms your booking and arranges payment.
        </p>
      </form>
    </aside>
  );
}
