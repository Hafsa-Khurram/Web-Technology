import { useState } from "react";
import { FiTag, FiTrash2, FiUsers, FiStar, FiPlus, FiEdit2 } from "react-icons/fi";
import { Badge, Empty, Loader, Modal, Stars } from "../../components/ui";
import { DashHead } from "./DashboardLayout";
import { api, fmtDate } from "../../api";
import { useApi, useTitle } from "../../hooks";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

/* ---------------- Discounts (coupons) ---------------- */

export function Discounts() {
  useTitle("Discounts");
  const toast = useToast();
  const { data, loading, error, reload } = useApi("/coupons");
  const [form, setForm] = useState({ code: "", percent: 10, description: "", expiresAt: "" });
  const [err, setErr] = useState("");

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api("/coupons", { method: "POST", body: { ...form, percent: Number(form.percent) } });
      toast(`Code ${form.code.toUpperCase()} created`);
      setForm({ code: "", percent: 10, description: "", expiresAt: "" });
      reload();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const act = async (fn, msg) => {
    try {
      await fn();
      toast(msg);
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <DashHead title="Discounts" />
      <div className="dash-grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <div>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="form-error">{error}</div>
          ) : data.coupons.length === 0 ? (
            <Empty icon={FiTag} title="No promo codes yet">Create one and customers can use it at checkout.</Empty>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Code</th><th>Discount</th><th>Description</th><th>Expires</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {data.coupons.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.percent}%</td>
                      <td>{c.description || "—"}</td>
                      <td>{c.expiresAt ? fmtDate(c.expiresAt) : "Never"}</td>
                      <td><Badge value={c.isActive ? "active" : "inactive"} /></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/coupons/${c._id}`, { method: "PATCH", body: { isActive: !c.isActive } }), c.isActive ? "Code turned off" : "Code turned on")}>
                            {c.isActive ? "Turn off" : "Turn on"}
                          </button>
                          <button className="icon-btn" aria-label="Delete code" style={{ color: "var(--alert)" }} onClick={() => act(() => api(`/coupons/${c._id}`, { method: "DELETE" }), "Code deleted")}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <form className="panel" onSubmit={create}>
          <h3>New promo code</h3>
          {err && <div className="form-error">{err}</div>}
          <div className="field">
            <label htmlFor="cc">Code</label>
            <input id="cc" className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="EID25" />
          </div>
          <div className="field">
            <label htmlFor="cp">Percent off</label>
            <input id="cp" type="number" min={1} max={90} className="input" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="cd">Description</label>
            <input id="cd" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="ce">Expires (optional)</label>
            <input id="ce" type="date" className="input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <button className="btn btn-sun btn-block"><FiPlus /> Create code</button>
        </form>
      </div>
    </>
  );
}

/* ---------------- Users / customers ---------------- */

export function Users() {
  const { user: me } = useAuth();
  const isAdmin = me.role === "admin";
  useTitle(isAdmin ? "Users" : "Customers");
  const toast = useToast();
  const [role, setRole] = useState("all");
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useApi(`/users?role=${role}`);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const s = q.trim().toLowerCase();
  const rows = (data?.users || []).filter((u) => !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));

  const remove = async () => {
    try {
      await api(`/users/${removing._id}`, { method: "DELETE" });
      toast("Account deleted");
      setRemoving(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
      setRemoving(null);
    }
  };

  return (
    <>
      <DashHead title={isAdmin ? "Users" : "Customers"}>
        {isAdmin && (
          <button className="btn btn-sun" onClick={() => setEditing({ name: "", email: "", phone: "", role: "agent", password: "" })}>
            <FiPlus /> New account
          </button>
        )}
      </DashHead>
      <div className="toolbar">
        <input className="input search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        {isAdmin && (
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="agent">Agents</option>
            <option value="admin">Admins</option>
          </select>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : rows.length === 0 ? (
        <Empty icon={FiUsers} title="No accounts found" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Role</th><th>Bookings</th><th>Joined</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong><div className="muted small">{u.email}</div></td>
                  <td>{u.phone || "—"}</td>
                  <td><Badge value={u.role} /></td>
                  <td>{u.bookingCount}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td><Badge value={u.isActive ? "active" : "inactive"} /></td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" aria-label="Edit" onClick={() => setEditing({ ...u, password: "" })}><FiEdit2 /></button>
                      {isAdmin && u._id !== me._id && (
                        <button className="icon-btn" aria-label="Delete" style={{ color: "var(--alert)" }} onClick={() => setRemoving(u)}><FiTrash2 /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <UserForm initial={editing} isAdmin={isAdmin} self={editing._id === me._id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {removing && (
        <Modal title="Delete this account?" subtitle={`${removing.name} · ${removing.email}`} onClose={() => setRemoving(null)}>
          <p>This can't be undone. Accounts with active bookings can't be deleted; deactivate them instead.</p>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => setRemoving(null)}>Keep account</button>
            <button className="btn btn-danger" onClick={remove}>Delete account</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function UserForm({ initial, isAdmin, self, onClose, onSaved }) {
  const toast = useToast();
  const isNew = !initial._id;
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const body = { name: form.name, email: form.email, phone: form.phone };
    if (isAdmin) {
      body.role = form.role;
      if (!isNew) body.isActive = form.isActive;
      if (form.password) body.password = form.password;
    }
    try {
      await api(isNew ? "/users" : `/users/${initial._id}`, { method: isNew ? "POST" : "PATCH", body });
      toast(isNew ? "Account created" : "Account saved");
      onSaved();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <Modal title={isNew ? "New account" : "Edit account"} onClose={onClose}>
      <form onSubmit={submit}>
        {err && <div className="form-error">{err}</div>}
        <div className="field"><label htmlFor="un">Full name</label><input id="un" className="input" value={form.name} onChange={set("name")} required /></div>
        <div className="grid-2">
          <div className="field"><label htmlFor="ue">Email</label><input id="ue" type="email" className="input" value={form.email} onChange={set("email")} required /></div>
          <div className="field"><label htmlFor="up">Phone</label><input id="up" className="input" value={form.phone || ""} onChange={set("phone")} /></div>
        </div>
        {isAdmin && (
          <>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="ur">Role</label>
                <select id="ur" className="select" value={form.role} onChange={set("role")} disabled={self}>
                  <option value="customer">Customer</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="upw">{isNew ? "Password" : "Reset password"}</label>
                <input id="upw" type="password" minLength={6} className="input" value={form.password} onChange={set("password")} required={isNew} placeholder={isNew ? "6+ characters" : "Leave blank to keep"} autoComplete="new-password" />
              </div>
            </div>
            {!isNew && !self && (
              <label className="row small" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={set("isActive")} /> Account active (inactive accounts can't log in)
              </label>
            )}
          </>
        )}
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-sun">{isNew ? "Create account" : "Save account"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Reviews ---------------- */

export function Reviews() {
  useTitle("Reviews");
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi("/feedback");

  const remove = async (id) => {
    try {
      await api(`/feedback/${id}`, { method: "DELETE" });
      toast("Review removed");
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <DashHead title="Customer reviews" />
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : data.feedback.length === 0 ? (
        <Empty icon={FiStar} title="No reviews yet">Customers can review trips once they're completed.</Empty>
      ) : (
        <div className="reviews">
          {data.feedback.map((f) => (
            <div className="review" key={f._id}>
              <div className="row">
                <Stars value={f.rating} />
                <span className="spacer" />
                <span className="muted small">{fmtDate(f.createdAt)}</span>
              </div>
              <blockquote>{f.comment || <span className="muted">No comment</span>}</blockquote>
              <div className="row">
                <div className="by"><strong>{f.user?.name}</strong> on {f.package?.title}</div>
                <span className="spacer" />
                {user.role === "admin" && (
                  <button className="icon-btn" aria-label="Remove review" style={{ color: "var(--alert)" }} onClick={() => remove(f._id)}>
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
