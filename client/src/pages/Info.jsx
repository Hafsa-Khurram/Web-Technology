import { useState } from "react";
import { Link } from "react-router-dom";
import { FiShield, FiHeadphones, FiTag, FiMap, FiMail, FiPhone, FiMapPin, FiCompass } from "react-icons/fi";
import { useTitle } from "../hooks";
import { useToast } from "../context/ToastContext";
import { Empty } from "../components/ui";

export function About() {
  useTitle("About us");
  return (
    <>
      <section className="page-hero with-img" style={{ backgroundImage: "url(/images/Map.jpg)" }}>
        <div className="wrap">
          <h1>About GoTravel</h1>
          <p>A small agency with a simple idea: well-planned trips, fair prices and someone to call when you need help.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>We plan the trip. You enjoy it.</h2>
            <p>
              GoTravel brings together hand-picked tour packages across Europe, Asia and the Americas, and the
              valleys of northern Pakistan. Every package is built by our agents, who handle bookings, payments and
              changes, so you always know where your trip stands.
            </p>
            <p>
              Our booking system keeps everything in one place: you can browse packages, book in a couple of minutes,
              track your booking status, download invoices and review your trip when you're back.
            </p>
            <Link to="/packages" className="btn btn-sun">Browse packages</Link>
          </div>
          <img src="/images/03.jpg" alt="Passport on a world map" />
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Our services</h2>
          </div>
          <div className="feature-list">
            <div className="feature">
              <FiMap />
              <h3>Curated packages</h3>
              <p>Stays, guided tours and transfers bundled into one clear price per person.</p>
            </div>
            <div className="feature">
              <FiHeadphones />
              <h3>Dedicated agents</h3>
              <p>A real agent reviews and confirms every booking, and can change dates or travellers for you.</p>
            </div>
            <div className="feature">
              <FiTag />
              <h3>Discounts and offers</h3>
              <p>Seasonal promo codes and group discounts applied straight to your invoice.</p>
            </div>
            <div className="feature">
              <FiShield />
              <h3>Secure accounts</h3>
              <p>Encrypted passwords and token-based login keep your bookings and details private.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  useTitle("Contact");
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    toast("Message sent. We'll reply within one working day.");
    e.target.reset();
  };

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Contact us</h1>
          <p>Questions about a package or an existing booking? Send us a message.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div className="stack">
            <div className="feature"><FiMapPin /><h3>Office</h3><p>COMSATS University Road, Abbottabad, Pakistan</p></div>
            <div className="feature"><FiPhone /><h3>Phone</h3><p>+92 300 1234567 (Mon to Sat, 9am to 6pm)</p></div>
            <div className="feature"><FiMail /><h3>Email</h3><p>hello@gotravel.com</p></div>
          </div>
          <form className="panel" onSubmit={submit}>
            <h3>Send a message</h3>
            {sent && <p className="muted small">Thanks! Your last message was sent.</p>}
            <div className="grid-2">
              <div className="field"><label htmlFor="cn">Name</label><input id="cn" className="input" required /></div>
              <div className="field"><label htmlFor="ce">Email</label><input id="ce" type="email" className="input" required /></div>
            </div>
            <div className="field"><label htmlFor="cs">Subject</label><input id="cs" className="input" required /></div>
            <div className="field"><label htmlFor="cm">Message</label><textarea id="cm" className="textarea" required /></div>
            <button className="btn btn-sun">Send message</button>
          </form>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  useTitle("Page not found");
  return (
    <div className="wrap section">
      <Empty icon={FiCompass} title="This page took a wrong turn" action={<Link to="/" className="btn">Go to homepage</Link>}>
        The page you're looking for doesn't exist or has moved.
      </Empty>
    </div>
  );
}
