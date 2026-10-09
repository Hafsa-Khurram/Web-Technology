import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiBriefcase, FiEdit2, FiPrinter } from "react-icons/fi";
import { Badge, Empty, Loader, Modal } from "../../components/ui";
import { DashHead } from "./DashboardLayout";
import { api, fmtDate, money } from "../../api";
import { useApi, useTitle } from "../../hooks";
import { useToast } from "../../context/ToastContext";

export default function Bookings() {
  useTitle("Bookings");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const status = params.get("status") || "all";
  const paymentStatus = params.get("paymentStatus") || "all";
  const { data, loading, error, reload } = useApi(`/bookings?status=${status}&paymentStatus=${paymentStatus}`);
  const [openId, setOpenId] = useState(null);

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v === "all") next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const s = q.trim().toLowerCase();
  const rows = (data?.bookings || []).filter(
    (b) =>
      !s ||
      b.bookingRef.toLowerCase().includes(s) ||
      b.user?.name?.toLowerCase().includes(s) ||
      b.user?.email?.toLowerCase().includes(s) ||
      b.package?.title?.toLowerCase().includes(s)
  );
  const open = rows.find((b) => b._id === openId) || data?.bookings.find((b) => b._id === openId);

  return (
    <>
      <DashHead title="Bookings" />
      <div className="toolbar">
        <input className="input search" placeholder="Search by ref, customer or package" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        <select className="select" value={status} onChange={(e) => setFilter("status", e.target.value)} aria-label="Booking status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="select" value={paymentStatus} onChange={(e) => setFilter("paymentStatus", e.target.value)} aria-label="Payment status">
          <option value="all">All payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : rows.length === 0 ? (
        <Empty icon={FiBriefcase} title="No bookings match">Try clearing the filters.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Travel date</th>
                <th>Pax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id}>
                  <td><strong>{b.bookingRef}</strong><div className="muted small">{fmtDate(b.createdAt)}</div></td>
                  <td>{b.user?.name}<div className="muted small">{b.user?.email}</div></td>
                  <td>{b.package?.title}</td>
                  <td>{fmtDate(b.travelDate)}</td>
                  <td>{b.travelers}</td>
                  <td>{money(b.total)}<div className="muted small">paid {money(b.amountPaid)}</div></td>
                  <td><Badge value={b.status} /></td>
                  <td><Badge value={b.paymentStatus} /></td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(b._id)}>
                        <FiEdit2 /> Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <ManageBooking booking={open} onClose={() => setOpenId(null)} onChanged={reload} />}
    </>
  );
}

function ManageBooking({ booking: b, onClose, onChanged }) {
  const toast = useToast();
  const [tab, setTab] = useState("details");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState({
    travelers: b.travelers,
    travelDate: b.travelDate?.slice(0, 10),
    contactPhone: b.contactPhone,
    notes: b.notes,
  });
  const [pay, setPay] = useState({ amount: "", method: "cash", reference: "" });
  const [disc, setDisc] = useState(b.discountPercent || 0);
  const balance = Math.max(b.total - b.amountPaid, 0);

  const run = async (fn, okMsg) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
      toast(okMsg);
      onChanged();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status) =>
    run(() => api(`/bookings/${b._id}`, { method: "PATCH", body: { status } }), `Booking marked ${status}`);

  return (
    <Modal wide title={`Booking ${b.bookingRef}`} subtitle={`${b.user?.name} · ${b.package?.title}`} onClose={onClose}>
      <div className="tabs" role="tablist">
        {[["details", "Details"], ["edit", "Modify"], ["payments", "Payments"], ["discount", "Discount"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setErr(""); }}>
            {l}
          </button>
        ))}
      </div>
      {err && <div className="form-error">{err}</div>}

      {tab === "details" && (
        <div>
          <div className="grid-2" style={{ gap: "8px 24px" }}>
            <Info label="Customer" value={<>{b.user?.name}<div className="muted small">{b.user?.email} · {b.contactPhone || "no phone"}</div></>} />
            <Info label="Package" value={b.package?.title} />
            <Info label="Travel date" value={fmtDate(b.travelDate)} />
            <Info label="Travellers" value={b.travelers} />
            <Info label="Status" value={<Badge value={b.status} />} />
            <Info label="Payment" value={<><Badge value={b.paymentStatus} /> <span className="small">{money(b.amountPaid)} of {money(b.total)}</span></>} />
          </div>
          {b.notes && <p style={{ marginTop: 14 }}><strong>Customer requests:</strong> {b.notes}</p>}
          <div className="row" style={{ marginTop: 20 }}>
            {b.status === "pending" && <button className="btn" disabled={busy} onClick={() => setStatus("confirmed")}>Confirm booking</button>}
            {b.status === "confirmed" && <button className="btn" disabled={busy} onClick={() => setStatus("completed")}>Mark trip completed</button>}
            {["pending", "confirmed"].includes(b.status) && (
              <button className="btn btn-danger" disabled={busy} onClick={() => setStatus("cancelled")}>Cancel booking</button>
            )}
            {b.status === "cancelled" && b.amountPaid > 0 && b.paymentStatus !== "refunded" && (
              <button className="btn btn-ghost" disabled={busy} onClick={() => run(() => api(`/bookings/${b._id}/refund`, { method: "POST" }), "Refund recorded")}>
                Mark as refunded
              </button>
            )}
            <span className="spacer" />
            <Link className="btn btn-ghost" to={`/invoice/${b._id}`}><FiPrinter /> Invoice</Link>
          </div>
        </div>
      )}

      {tab === "edit" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => api(`/bookings/${b._id}`, { method: "PATCH", body: edit }), "Booking updated and customer notified");
          }}
        >
          <div className="grid-2">
            <div className="field">
              <label htmlFor="et">Travellers</label>
              <input id="et" type="number" min={1} max={20} className="input" value={edit.travelers} onChange={(e) => setEdit({ ...edit, travelers: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="ed">Travel date</label>
              <input id="ed" type="date" className="input" value={edit.travelDate} onChange={(e) => setEdit({ ...edit, travelDate: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ep">Contact phone</label>
            <input id="ep" className="input" value={edit.contactPhone} onChange={(e) => setEdit({ ...edit, contactPhone: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="en">Notes</label>
            <textarea id="en" className="textarea" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
          </div>
          <p className="muted small">The total is recalculated at {money(b.unitPrice)} per traveller, keeping any discount.</p>
          <div className="modal-foot">
            <button className="btn" disabled={busy || b.status === "cancelled"}>Save changes</button>
          </div>
        </form>
      )}

      {tab === "payments" && (
        <div>
          <div className="kpis" style={{ marginBottom: 16 }}>
            <div className="kpi"><div className="label">Total</div><div className="value">{money(b.total)}</div></div>
            <div className="kpi"><div className="label">Paid</div><div className="value">{money(b.amountPaid)}</div></div>
            <div className="kpi"><div className="label">Balance</div><div className="value">{money(balance)}</div></div>
          </div>
          {b.payments.length > 0 ? (
            b.payments.map((p) => (
              <div className="pay-row" key={p._id}>
                <span>{fmtDate(p.date)} · <span style={{ textTransform: "capitalize" }}>{p.method.replace("-", " ")}</span> {p.reference && `· ${p.reference}`}</span>
                <strong>{money(p.amount)}</strong>
              </div>
            ))
          ) : (
            <p className="muted">No payments recorded yet.</p>
          )}
          {balance > 0 && b.status !== "cancelled" && (
            <form
              style={{ marginTop: 18 }}
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  await api(`/bookings/${b._id}/payments`, { method: "POST", body: { ...pay, amount: Number(pay.amount) } });
                  setPay({ amount: "", method: "cash", reference: "" });
                }, "Payment recorded");
              }}
            >
              <h3>Record a payment</h3>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="pa">Amount ($)</label>
                  <input id="pa" type="number" step="0.01" min="0.01" max={balance} className="input" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} required />
                  <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "start" }} onClick={() => setPay({ ...pay, amount: balance })}>Fill full balance</button>
                </div>
                <div className="field">
                  <label htmlFor="pm">Method</label>
                  <select id="pm" className="select" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank-transfer">Bank transfer</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="pr">Reference (optional)</label>
                <input id="pr" className="input" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} placeholder="Transaction ID or receipt number" />
              </div>
              <div className="modal-foot">
                <button className="btn" disabled={busy}>Record payment</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "discount" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => api(`/bookings/${b._id}/discount`, { method: "PATCH", body: { percent: Number(disc) } }), "Discount applied");
          }}
        >
          <p>
            Current: {b.discountPercent ? `${b.discountPercent}% off${b.discountCode ? ` (${b.discountCode})` : ""} = −${money(b.discountAmount)}` : "no discount"}.
          </p>
          <div className="field">
            <label htmlFor="dp">Discount percentage</label>
            <input id="dp" type="number" min={0} max={90} className="input" value={disc} onChange={(e) => setDisc(e.target.value)} />
            <span className="hint">
              New total: {money(b.subtotal - (b.subtotal * Number(disc || 0)) / 100)} (subtotal {money(b.subtotal)})
            </span>
          </div>
          <div className="modal-foot">
            <button className="btn" disabled={busy || b.status === "cancelled"}>Apply discount</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <div className="muted small">{label}</div>
      <div>{value}</div>
    </div>
  );
}
