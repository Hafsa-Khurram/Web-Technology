import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiCompass } from "react-icons/fi";
import PackageCard from "../components/PackageCard";
import { Empty, Loader } from "../components/ui";
import { useApi, useTitle } from "../hooks";

const CATEGORIES = ["All", "Beach", "Adventure", "Culture", "City", "Nature", "Luxury"];

export default function Packages() {
  useTitle("Tour packages");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  // keep the text box in sync if the URL changes (e.g. from the homepage)
  useEffect(() => setQ(params.get("q") || ""), [params]);

  const { data, loading, error } = useApi(`/packages?${params.toString()}`);
  const category = params.get("category") || "All";

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const submit = (e) => {
    e.preventDefault();
    update("q", q.trim());
  };

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Tour packages</h1>
          <p>Every price is per person and includes accommodation, guided tours and local transfers.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="wrap layout-filters">
          <aside className="filters panel" aria-label="Filters">
            <form onSubmit={submit} className="field">
              <label htmlFor="q">Destination</label>
              <div className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
                <input id="q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="City or country" />
                <button className="btn" aria-label="Search" style={{ padding: "0 14px", alignSelf: "stretch", borderRadius: 8 }}>
                  <FiSearch />
                </button>
              </div>
            </form>

            <div className="field">
              <label>Trip style</label>
              <div className="chips">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" className={`chip ${category === c ? "on" : ""}`} onClick={() => update("category", c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="maxPrice">Budget per person</label>
              <select id="maxPrice" className="select" value={params.get("maxPrice") || ""} onChange={(e) => update("maxPrice", e.target.value)}>
                <option value="">Any budget</option>
                <option value="800">Up to $800</option>
                <option value="1200">Up to $1,200</option>
                <option value="1600">Up to $1,600</option>
                <option value="3000">Up to $3,000</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="maxDays">Trip length</label>
              <select id="maxDays" className="select" value={params.get("maxDays") || ""} onChange={(e) => update("maxDays", e.target.value)}>
                <option value="">Any length</option>
                <option value="4">Up to 4 days</option>
                <option value="6">Up to 6 days</option>
                <option value="8">Up to 8 days</option>
              </select>
            </div>

            {[...params.keys()].length > 0 && (
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            )}
          </aside>

          <div>
            <div className="row" style={{ marginBottom: 18 }}>
              <span className="muted">{data ? `${data.packages.length} package${data.packages.length === 1 ? "" : "s"} found` : " "}</span>
              <span className="spacer" />
              <label className="small muted" htmlFor="sort">
                Sort by
              </label>
              <select id="sort" className="select" style={{ width: "auto" }} value={params.get("sort") || ""} onChange={(e) => update("sort", e.target.value)}>
                <option value="">Newest</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="duration">Shortest first</option>
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : error ? (
              <div className="form-error">{error}</div>
            ) : data.packages.length === 0 ? (
              <Empty icon={FiCompass} title="No trips match these filters">
                Try a different destination or widen your budget.
              </Empty>
            ) : (
              <div className="ticket-grid">
                {data.packages.map((p) => (
                  <PackageCard key={p._id} pkg={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
