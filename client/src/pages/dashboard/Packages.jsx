import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiMap, FiEyeOff, FiEye } from "react-icons/fi";
import { Badge, Empty, Loader, Modal } from "../../components/ui";
import { DashHead } from "./DashboardLayout";
import { api, money } from "../../api";
import { useApi, useTitle } from "../../hooks";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = ["Beach", "Adventure", "Culture", "City", "Nature", "Luxury"];
const GALLERY = [
  "country-1.jpg", "country-2.jpg", "country-3.jpg", "country-4.jpg", "country-5.jpg", "country-6.jpg",
  "1.jpg", "5.jpg", "10.jpg", "01.jpg", "bg-1.jpg", "bg-2.jpg", "Scene.jpg", "pexels-emrecan-2079228.jpg",
  "grid-1.jpg", "grid-2.jpg", "grid-3.jpg", "2.jpg", "3.jpg", "4.jpg", "6.jpg", "7.jpg", "8.jpg",
].map((f) => `/images/${f}`);

const blank = {
  title: "", destination: "", country: "", category: "Nature", description: "", highlights: "",
  price: "", durationDays: 5, seats: 20, image: GALLERY[0], isActive: true,
};

export default function AdminPackages() {
  useTitle("Packages");
  const toast = useToast();
  const { data, loading, error, reload } = useApi("/packages?all=1");
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const toggle = async (p) => {
    try {
      await api(`/packages/${p._id}`, { method: "PUT", body: { isActive: !p.isActive } });
      toast(p.isActive ? "Package hidden from customers" : "Package is live again");
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const remove = async () => {
    try {
      const d = await api(`/packages/${removing._id}`, { method: "DELETE" });
      toast(d.message);
      setRemoving(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <DashHead title="Packages">
        <button className="btn btn-sun" onClick={() => setEditing(blank)}>
          <FiPlus /> New package
        </button>
      </DashHead>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : data.packages.length === 0 ? (
        <Empty icon={FiMap} title="No packages yet" action={<button className="btn" onClick={() => setEditing(blank)}>Create the first one</button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>Package</th>
                <th>Category</th>
                <th>Price</th>
                <th>Days</th>
                <th>Seats</th>
                <th>Rating</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.packages.map((p) => (
                <tr key={p._id}>
                  <td><img className="thumb" src={p.image} alt="" /></td>
                  <td>
                    <Link to={`/packages/${p._id}`}><strong>{p.title}</strong></Link>
                    <div className="muted small">{p.destination}, {p.country}</div>
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.durationDays}</td>
                  <td>{p.seats}</td>
                  <td>{p.ratingCount ? `${p.ratingAvg.toFixed(1)} (${p.ratingCount})` : "—"}</td>
                  <td><Badge value={p.isActive ? "active" : "inactive"} /></td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" aria-label={p.isActive ? "Hide package" : "Show package"} title={p.isActive ? "Hide" : "Show"} onClick={() => toggle(p)}>
                        {p.isActive ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button className="icon-btn" aria-label="Edit package" title="Edit" onClick={() => setEditing({ ...p, highlights: (p.highlights || []).join("\n") })}>
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn" aria-label="Delete package" title="Delete" style={{ color: "var(--alert)" }} onClick={() => setRemoving(p)}>
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

      {editing && <PackageForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}

      {removing && (
        <Modal title="Delete this package?" subtitle={removing.title} onClose={() => setRemoving(null)}>
          <p>If customers have booked it, it will be hidden instead so their booking history stays intact.</p>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => setRemoving(null)}>Keep package</button>
            <button className="btn btn-danger" onClick={remove}>Delete package</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function PackageForm({ initial, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const isNew = !initial._id;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const body = {
      ...form,
      price: Number(form.price),
      durationDays: Number(form.durationDays),
      seats: Number(form.seats),
    };
    try {
      await api(isNew ? "/packages" : `/packages/${initial._id}`, { method: isNew ? "POST" : "PUT", body });
      toast(isNew ? "Package created" : "Package saved");
      onSaved();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal wide title={isNew ? "New package" : "Edit package"} onClose={onClose}>
      <form onSubmit={submit}>
        {err && <div className="form-error">{err}</div>}
        <div className="field">
          <label htmlFor="pt">Title</label>
          <input id="pt" className="input" value={form.title} onChange={set("title")} required maxLength={120} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="pd">Destination</label>
            <input id="pd" className="input" value={form.destination} onChange={set("destination")} required />
          </div>
          <div className="field">
            <label htmlFor="pc">Country</label>
            <input id="pc" className="input" value={form.country} onChange={set("country")} required />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="pcat">Category</label>
            <select id="pcat" className="select" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pp">Price per person ($)</label>
            <input id="pp" type="number" min={0} className="input" value={form.price} onChange={set("price")} required />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="pdays">Duration (days)</label>
            <input id="pdays" type="number" min={1} className="input" value={form.durationDays} onChange={set("durationDays")} required />
          </div>
          <div className="field">
            <label htmlFor="ps">Seats per departure</label>
            <input id="ps" type="number" min={1} className="input" value={form.seats} onChange={set("seats")} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="pdesc">Description</label>
          <textarea id="pdesc" className="textarea" value={form.description} onChange={set("description")} required />
        </div>
        <div className="field">
          <label htmlFor="ph">What's included</label>
          <textarea id="ph" className="textarea" value={form.highlights} onChange={set("highlights")} placeholder="One item per line" />
          <span className="hint">One item per line.</span>
        </div>
        <div className="field">
          <label>Cover image</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 8 }}>
            {GALLERY.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => setForm((f) => ({ ...f, image: src }))}
                aria-label={`Use image ${src.split("/").pop()}`}
                style={{
                  padding: 0,
                  border: form.image === src ? "3px solid var(--sun)" : "3px solid transparent",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  aspectRatio: "4/3",
                }}
              >
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              </button>
            ))}
          </div>
          <input className="input" value={form.image} onChange={set("image")} aria-label="Image URL" placeholder="or paste an image URL" />
        </div>
        <label className="row small" style={{ gap: 8 }}>
          <input type="checkbox" checked={form.isActive} onChange={set("isActive")} /> Visible to customers
        </label>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-sun" disabled={busy}>{isNew ? "Create package" : "Save package"}</button>
        </div>
      </form>
    </Modal>
  );
}
