import { Link } from "react-router-dom";
import { useTitle } from "../hooks";

const posts = [
  {
    image: "/images/1.jpg",
    title: "10 places to visit this year",
    summary: "From hidden gems to iconic landmarks, the destinations our travellers loved most.",
    body: "Our top picks mix the famous with the quiet: Santorini at sunset, Hunza in autumn, the lakes of Banff and the salt flats of Bolivia. Go in shoulder season for fewer crowds and better prices.",
  },
  {
    image: "/images/2.jpg",
    title: "Luxury resorts worth the splurge",
    summary: "Overwater villas, cliffside suites and the small touches that make a stay special.",
    body: "The best luxury stays don't just add marble; they add space and privacy. Look for resorts with included transfers and dining so the price you see is close to the price you pay.",
  },
  {
    image: "/images/3.jpg",
    title: "How to travel on a budget",
    summary: "Practical ways to save money without missing the best experiences.",
    body: "Book packages early, travel midweek and use promo codes. Group bookings often unlock better rates, and a package that bundles hotels and transfers usually beats booking each piece separately.",
  },
  {
    image: "/images/4.jpg",
    title: "The guide to solo travel",
    summary: "The joys and challenges of travelling alone, and how to stay safe.",
    body: "Join small-group tours for the parts of a trip that are better shared, and keep free days for yourself. Share your itinerary with someone at home and keep digital copies of your documents.",
  },
  {
    image: "/images/country-5.jpg",
    title: "Hidden beaches around the world",
    summary: "Remote, unspoiled beaches perfect for a quiet getaway.",
    body: "Thailand's outer islands, Zakynthos' southern coves and the sandbanks of the Maldives are all still blissfully quiet early in the morning. Go before 9am and you may have them to yourself.",
  },
  {
    image: "/images/6.jpg",
    title: "A beginner's guide to adventure travel",
    summary: "From hiking to hot-air balloons, where to start if you want a thrill.",
    body: "Start with guided adventures like a Cappadocia balloon flight or a Banff day hike. Good operators provide the gear and the safety briefing, so all you need is comfortable shoes and curiosity.",
  },
];

const destinations = [
  { image: "/images/country-1.jpg", name: "Santorini, Greece", q: "Santorini" },
  { image: "/images/country-2.jpg", name: "Venice, Italy", q: "Venice" },
  { image: "/images/country-3.jpg", name: "San Francisco, USA", q: "San Francisco" },
  { image: "/images/country-6.jpg", name: "Krabi, Thailand", q: "Thailand" },
];

export default function Blog() {
  useTitle("Travel blog");
  return (
    <>
      <section className="page-hero with-img" style={{ backgroundImage: "url(/images/pexels-pixabay-210012.jpg)" }}>
        <div className="wrap">
          <h1>GoTravel blog</h1>
          <p>Travel tips, guides and hidden gems from our agents and travellers.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Latest posts</h2>
          </div>
          <div className="blog-grid">
            {posts.map((p) => (
              <article className="post" key={p.title}>
                <img src={p.image} alt="" loading="lazy" />
                <div className="post-body">
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <details>
                    <summary>Read more</summary>
                    <p>{p.body}</p>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Popular destinations</h2>
          </div>
          <div className="blog-grid">
            {destinations.map((d) => (
              <Link key={d.name} to={`/packages?q=${encodeURIComponent(d.q)}`} className="dest" style={{ height: 240 }}>
                <img src={d.image} alt={d.name} loading="lazy" />
                <span>{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
