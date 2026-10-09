import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FiDollarSign, FiBriefcase, FiUsers, FiStar, FiCreditCard, FiMap } from "react-icons/fi";
import { Loader } from "../../components/ui";
import { DashHead } from "./DashboardLayout";
import { useApi, useTitle } from "../../hooks";
import { money } from "../../api";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS = { pending: "#C98A12", confirmed: "#2A9D7F", completed: "#0E5A63", cancelled: "#C9473F" };

export default function Overview() {
  useTitle("Dashboard");
  const { user } = useAuth();
  const { data, loading, error } = useApi("/analytics");

  if (loading) return <Loader />;
  if (error) return <div className="form-error">{error}</div>;
  const { totals, byStatus, monthly, topPackages, byPayment } = data;
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  const maxTop = Math.max(...topPackages.map((p) => p.revenue), 1);

  return (
    <>
      <DashHead title={`Hello, ${user.name.split(" ")[0]}`}>
        <Link to="/dashboard/bookings?status=pending" className="btn btn-sun">
          Review pending bookings ({byStatus.pending || 0})
        </Link>
      </DashHead>

      <div className="kpis">
        <Kpi icon={FiDollarSign} label="Booked revenue" value={money(totals.revenue)} sub="excludes cancellations" />
        <Kpi icon={FiCreditCard} label="Collected" value={money(totals.collected)} sub={`${money(totals.outstanding)} outstanding`} />
        <Kpi icon={FiBriefcase} label="Bookings" value={totals.bookings} sub={`${totals.travelers} travellers`} />
        <Kpi icon={FiUsers} label="Customers" value={totals.customers} sub={`${totals.agents} agent${totals.agents === 1 ? "" : "s"}`} />
        <Kpi icon={FiMap} label="Active packages" value={totals.packages} />
        <Kpi icon={FiStar} label="Average rating" value={totals.avgRating ? `${totals.avgRating} / 5` : "—"} sub={`${totals.reviews} reviews`} />
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Revenue, last 6 months</h3>
            <span className="muted small">by booking date</span>
          </div>
          <div style={{ height: 270 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#E6EEEF" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} width={48} />
                <Tooltip formatter={(v, n) => (n === "revenue" ? money(v) : v)} cursor={{ fill: "rgba(14,90,99,0.06)" }} />
                <Bar dataKey="revenue" fill="#0E5A63" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Booking status</h3>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} isAnimationActive={false}>
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="stack" style={{ marginTop: 8 }}>
            {Object.entries(byStatus).map(([k, v]) => (
              <div key={k} className="row small" style={{ marginTop: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[k] }} />
                <span style={{ textTransform: "capitalize" }}>{k}</span>
                <span className="spacer" />
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Top packages by revenue</h3>
          </div>
          {topPackages.length === 0 ? (
            <p className="muted">No bookings yet.</p>
          ) : (
            <div className="bar-list">
              {topPackages.map((p) => (
                <div key={p.title}>
                  <div className="row small">
                    <strong>{p.title}</strong>
                    <span className="spacer" />
                    <span className="muted">{p.bookings} booking{p.bookings === 1 ? "" : "s"} · {p.travelers} traveller{p.travelers === 1 ? "" : "s"}</span>
                    <strong>{money(p.revenue)}</strong>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${(p.revenue / maxTop) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <div className="panel-title">
            <h3>Payments</h3>
          </div>
          {Object.entries(byPayment).map(([k, v]) => (
            <div className="pay-row" key={k}>
              <span style={{ textTransform: "capitalize" }}>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          <Link to="/dashboard/bookings?paymentStatus=partial" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
            Follow up partial payments
          </Link>
        </div>
      </div>
    </>
  );
}

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="kpi">
      <div className="label">
        <Icon /> {label}
      </div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
