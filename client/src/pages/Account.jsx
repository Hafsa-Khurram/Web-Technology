import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiBriefcase, FiBell, FiCheckCircle, FiCreditCard, FiXCircle, FiStar, FiPrinter, FiInfo } from "react-icons/fi";
import { Badge, Empty, Loader, Modal, StarInput } from "../components/ui";
import { api, destCode, fmtDate, money } from "../api";
import { useApi, useTitle } from "../hooks";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/* ---------------- My bookings ---------------- */

export function MyBookings() {
  useTitle("My bookings");
  const { data, loading, error, reload } = useApi("/bookings/mine");
  const [tab, setTab] = useState("upcoming");
  const [reviewing, setReviewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const toast = useToast();
  const location = useLocation();
  const highlight = location.state?.highlight;

  const now = new Date();
  const all = data?.bookings || [];
  const groups = {
    upcoming: all.filter((b) => ["pending", "confirmed"].includes(b.status) && new Date(b.travelDate) >= now),
    past: all.filter((b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.travelDate) < now)),
    cancelled: all.filter((b) => b.status === "cancelled"),
  };

  const doCancel = async () => {
    try {
      await api(`/bookings/${cancelling._id}/cancel`, { method: "POST" });
      toast(`Booking ${cancelling.bookingRef} cancelled`);
      setCancelling(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>My bookings</h1>
          <p>Track your trips, view invoices and review places you've been.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="wrap">
          <div className="tabs" role="tablist">
            {[
              ["upcoming", "Upcoming"],
              ["past", "Past trips"],
              ["cancelled", "Cancelled"],
            ].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                {label} ({groups[k].length})
              </button>
            ))}
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="form-error">{error}</div>
          ) : groups[tab].length === 0 ? (
            <Empty
              icon={FiBriefcase}
              title={tab === "upcoming" ? "No upcoming trips yet" : tab === "past" ? "No past trips" : "No cancelled bookings"}
              action={tab === "upcoming" && <Link to="/packages" className="btn btn-sun">Find a trip</Link>}
            >
              {tab === "upcoming" && "Pick a package and your booking will show up here."}
            </Empty>
          ) : (
            <div className="stack">
              {groups[tab].map((b) => (
                <BoardingPass
                  key={b._id}
                  b={b}
                  highlight={b._id === highlight}
                  onCancel={() => setCancelling(b)}
                  onReview={() => setReviewing(b)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {cancelling && (
        <Modal title="Cancel this booking?" subtitle={`${cancelling.bookingRef} · ${cancelling.package?.title}`} onClose={() => setCancelling(null)}>
          <p>
            Your seats will be released. If you've already paid, our agent will contact you about a refund.
          </p>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => setCancelling(null)}>Keep booking</button>
            <button className="btn btn-danger" onClick={doCancel}>Cancel booking</button>
          </div>
        </Modal>
      )}

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function BoardingPass({ b, onCancel, onReview, highlight }) {
  const pkg = b.package || {};
  const canCancel = ["pending", "confirmed"].includes(b.status);
  const tripOver = b.status === "completed" || (b.status === "confirmed" && new Date(b.travelDate) < new Date());
  const canReview = tripOver && !b.feedbackGiven;
  const balance = Math.max(b.total - b.amountPaid, 0);

  return (
    <article className="pass" style={highlight ? { outline: "3px solid var(--sun)" } : undefined}>
      <div className="pass-main">
        <img src={pkg.image} alt="" />
        <div className="pass-info">
          <div className="row" style={{ gap: 8 }}>
            <Badge value={b.status} />
            <Badge value={b.paymentStatus} />
          </div>
          <h3 style={{ marginTop: 10 }}>{pkg.title || "Package removed"}</h3>
          <div className="muted small">{pkg.destination}, {pkg.country}</div>
          <dl className="pass-fields">
            <div><dt>Departs</dt><dd>{fmtDate(b.travelDate)}</dd></div>
            <div><dt>Travellers</dt><dd>{b.travelers}</dd></div>
            <div><dt>Duration</dt><dd>{pkg.durationDays} days</dd></div>
            <div><dt>Total</dt><dd>{money(b.total)}</dd></div>
            <div><dt>Paid</dt><dd>{money(b.amountPaid)}</dd></div>
            <div><dt>Balance</dt><dd>{money(balance)}</dd></div>
          </dl>
        </div>
      </div>
      <div className="pass-stub">
        <span className="ticket-code" aria-hidden="true">{destCode(pkg.destination)}</span>
        <div>
          <div className="muted small">Booking ref</div>
          <div className="pass-ref">{b.bookingRef}</div>
        </div>
        <Link to={`/invoice/${b._id}`} className="btn btn-ghost btn-sm"><FiPrinter /> Invoice</Link>
        {canReview && <button className="btn btn-sun btn-sm" onClick={onReview}><FiStar /> Rate trip</button>}
        {b.feedbackGiven && <span className="small muted"><FiCheckCircle style={{ verticalAlign: "-2px" }} /> Reviewed</span>}
        {canCancel && (
          <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ color: "var(--alert)" }}>
            <FiXCircle /> Cancel
          </button>
        )}
      </div>
    </article>
  );
}

function ReviewModal({ booking, onClose, onDone }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/feedback", { method: "POST", body: { bookingId: booking._id, rating, comment } });
      toast("Thanks! Your review is posted.");
      onDone();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Rate your trip" subtitle={booking.package?.title} onClose={onClose}>
      <form onSubmit={submit}>
        {err && <div className="form-error">{err}</div>}
        <div className="field">
          <label>Your rating</label>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <div className="field">
          <label htmlFor="cm">Tell other travellers about it</label>
          <textarea id="cm" className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="What did you love? Anything to improve?" />
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Not now</button>
          <button className="btn btn-sun" disabled={busy}>{busy ? "Posting..." : "Post review"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Notifications ---------------- */

const noteIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("payment") || t.includes("refund")) return <FiCreditCard />;
  if (t.includes("cancel")) return <FiXCircle />;
  if (t.includes("confirm") || t.includes("completed")) return <FiCheckCircle />;
  return <FiInfo />;
};

export function Notifications() {
  useTitle("Notifications");
  const { data, loading, error, reload } = useApi("/notifications");

  useEffect(() => {
    if (data?.unread > 0) {
      const t = setTimeout(() => api("/notifications/read-all", { method: "POST" }).catch(() => {}), 1500);
      return () => clearTimeout(t);
    }
  }, [data]);

  return (
    <>
      <section className="page-hero">
        <div className="wrap row">
          <div>
            <h1>Notifications</h1>
            <p>Booking confirmations, payment receipts and updates.</p>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="form-error">{error}</div>
          ) : data.notifications.length === 0 ? (
            <Empty icon={FiBell} title="You're all caught up">Updates about your bookings will appear here.</Empty>
          ) : (
            <div className="notes">
              {data.notifications.map((n) => (
                <div key={n._id} className={`note ${n.read ? "" : "unread"}`}>
                  <span className="ico">{noteIcon(n.title)}</span>
                  <div style={{ flex: 1 }}>
                    <div className="row">
                      <h4>{n.title}</h4>
                      <span className="spacer" />
                      <span className="muted small">{fmtDate(n.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p>{n.message}</p>
                    {n.link && <Link to={n.link} className="small">View details</Link>}
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ justifySelf: "start" }} onClick={reload}>Refresh</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ---------------- Profile ---------------- */

export function Profile() {
  useTitle("Profile");
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const d = await api("/auth/me", { method: "PATCH", body: form });
      setUser(d.user);
      toast("Profile saved");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api("/auth/me", { method: "PATCH", body: pw });
      setPw({ currentPassword: "", newPassword: "" });
      toast("Password changed");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Your profile</h1>
          <p>{user.email} · <span style={{ textTransform: "capitalize" }}>{user.role}</span> account</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          {err && <div className="form-error">{err}</div>}
          <div className="split" style={{ alignItems: "start", gap: 24 }}>
            <form className="panel" onSubmit={save}>
              <h3>Personal details</h3>
              <div className="field">
                <label htmlFor="pn">Full name</label>
                <input id="pn" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="pp">Phone</label>
                <input id="pp" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <button className="btn">Save changes</button>
            </form>
            <form className="panel" onSubmit={changePw}>
              <h3>Change password</h3>
              <div className="field">
                <label htmlFor="cp">Current password</label>
                <input id="cp" type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required autoComplete="current-password" />
              </div>
              <div className="field">
                <label htmlFor="np">New password</label>
                <input id="np" type="password" className="input" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required autoComplete="new-password" />
              </div>
              <button className="btn">Change password</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- Invoice ---------------- */

export function Invoice() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/bookings/${id}`);
  useTitle("Invoice");
  if (loading) return <Loader />;
  if (error) return <div className="wrap section"><div className="form-error">{error}</div></div>;
  const b = data.booking;
  const balance = Math.max(b.total - b.amountPaid, 0);

  return (
    <div className="wrap">
      <div className="row no-print" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => window.history.back()}>Back</button>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={() => window.print()}><FiPrinter /> Print or save as PDF</button>
      </div>
      <div className="invoice">
        <div className="invoice-head">
          <div>
            <h2 style={{ margin: 0 }}>GoTravel</h2>
            <div className="muted small">COMSATS University Road, Abbottabad · hello@gotravel.com</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0 }}>Invoice</h3>
            <div>{b.invoiceNumber}</div>
            <div className="muted small">Issued {fmtDate(b.createdAt)}</div>
          </div>
        </div>

        <div className="split" style={{ gap: 20, alignItems: "start" }}>
          <div>
            <div className="muted small">Billed to</div>
            <strong>{b.user?.name}</strong>
            <div>{b.user?.email}</div>
            <div>{b.contactPhone}</div>
          </div>
          <div>
            <div className="muted small">Booking</div>
            <strong>{b.bookingRef}</strong>
            <div>Travel date: {fmtDate(b.travelDate)}</div>
            <div className="row" style={{ gap: 6, marginTop: 4 }}><Badge value={b.status} /><Badge value={b.paymentStatus} /></div>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Description</th><th className="num">Unit price</th><th className="num">Qty</th><th className="num">Amount</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{b.package?.title} — {b.package?.durationDays} days, {b.package?.destination}</td>
              <td className="num">{money(b.unitPrice)}</td>
              <td className="num">{b.travelers}</td>
              <td className="num">{money(b.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <div className="totals">
          <div className="summary-line"><span>Subtotal</span><span>{money(b.subtotal)}</span></div>
          {b.discountAmount > 0 && (
            <div className="summary-line discount"><span>Discount {b.discountCode && `(${b.discountCode}, ${b.discountPercent}%)`}</span><span>−{money(b.discountAmount)}</span></div>
          )}
          <div className="summary-line total"><span>Total</span><span>{money(b.total)}</span></div>
          <div className="summary-line"><span>Paid</span><span>{money(b.amountPaid)}</span></div>
          <div className="summary-line" style={{ fontWeight: 700 }}><span>Balance due</span><span>{money(balance)}</span></div>
        </div>

        {b.payments?.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>Payments</h3>
            <table>
              <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {b.payments.map((p) => (
                  <tr key={p._id}>
                    <td>{fmtDate(p.date)}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.method.replace("-", " ")}</td>
                    <td>{p.reference || "—"}</td>
                    <td className="num">{money(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="muted small" style={{ marginTop: 28 }}>Thank you for travelling with GoTravel.</p>
      </div>
    </div>
  );
}
