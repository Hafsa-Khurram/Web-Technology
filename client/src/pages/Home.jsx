import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import PackageCard from "../components/PackageCard";
import { Loader, Stars } from "../components/ui";
import { api } from "../api";
import { useTitle } from "../hooks";

const CATEGORIES = ["All", "Beach", "Adventure", "Culture", "City", "Nature", "Luxury"];

const destinations = [
  { img: "/images/country-1.jpg", name: "Santorini", country: "Greece", q: "Santorini" },
  { img: "/images/5.jpg", name: "Hunza Valley", country: "Pakistan", q: "Hunza" },
  { img: "/images/country-6.jpg", name: "Phi Phi Islands", country: "Thailand", q: "Thailand" },
  { img: "/images/country-2.jpg", name: "Venice", country: "Italy", q: "Venice" },
  { img: "/images/1.jpg", name: "Banff", country: "Canada", q: "Banff" },
];

export default function Home() {
  useTitle("");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [budget, setBudget] = useState("");
  const [featured, setFeatured] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/packages?sort=rating")
      .then((d) => setFeatured(d.packages.slice(0, 6)))
      .catch(() => setFeatured([]));
    api("/feedback/latest")
      .then((d) => setReviews(d.reviews.slice(0, 3)))
      .catch(() => {});
    api("/stats/public")
      .then(setStats)
      .catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category !== "All") p.set("category", category);
    if (budget) p.set("maxPrice", budget);
    navigate(`/packages?${p.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Go further than the postcard.</h1>
          <p className="lead">
            Hand-picked tour packages with stays, guides and transfers sorted. Book in minutes and an agent confirms
            your trip within a day.
          </p>
          <form className="searchbar" onSubmit={search} role="search">
            <label>
              Where to?
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Santorini, Hunza, Bali..." />
            </label>
            <label>
              Trip style
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Budget per person
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Any budget</option>
                <option value="800">Up to $800</option>
                <option value="1200">Up to $1,200</option>
                <option value="1600">Up to $1,600</option>
              </select>
            </label>
            <button className="btn btn-sun" type="submit">
              <FiSearch /> Search
            </button>
          </form>
          {stats && (
            <div className="hero-stats">
              <div>
                <strong>{stats.packages}</strong>tour packages
              </div>
              <div>
                <strong>{stats.countries}</strong>countries
              </div>
              <div>
                <strong>{stats.travelers}+</strong>happy travellers
              </div>
              {stats.rating > 0 && (
                <div>
                  <strong>{stats.rating} / 5</strong>average rating
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Top rated trips</h2>
              <p>Rated by travellers who have already been. Prices include stays and guided tours.</p>
            </div>
            <Link to="/packages" className="btn btn-ghost">
              See all packages
            </Link>
          </div>
          {featured === null ? (
            <Loader />
          ) : featured.length === 0 ? (
            <p className="muted">Packages will appear here once the server is running and seeded.</p>
          ) : (
            <div className="ticket-grid">
              {featured.map((p) => (
                <PackageCard key={p._id} pkg={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Where people are going</h2>
              <p>From Aegean sunsets to the Karakoram, these are this season's most booked places.</p>
            </div>
          </div>
          <div className="dest-grid">
            {destinations.map((d) => (
              <Link key={d.name} to={`/packages?q=${encodeURIComponent(d.q)}`} className="dest">
                <img src={d.img} alt={d.name} loading="lazy" />
                <span>
                  {d.name}
                  <small>{d.country}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>How booking works</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Choose a package</h3>
              <p>Filter by style, budget and length. Every package lists exactly what's included.</p>
            </div>
            <div className="step">
              <h3>Book your dates</h3>
              <p>Pick a travel date and number of travellers. Add a promo code if you have one.</p>
            </div>
            <div className="step">
              <h3>Get confirmed</h3>
              <p>An agent reviews your booking and you get a confirmation notification and email with your invoice.</p>
            </div>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <h2>What travellers say</h2>
            </div>
            <div className="reviews">
              {reviews.map((r) => (
                <figure className="review" key={r._id} style={{ margin: 0 }}>
                  <Stars value={r.rating} />
                  <blockquote>{r.comment}</blockquote>
                  <figcaption className="by">
                    <strong>{r.user?.name}</strong> on {r.package?.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="promo">
            <div>
              <h2>First trip with us?</h2>
              <p>Use this code at checkout for 10% off any package.</p>
            </div>
            <div className="row">
              <span className="code">WELCOME10</span>
              <Link to="/packages" className="btn btn-sun">
                Find a trip
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
