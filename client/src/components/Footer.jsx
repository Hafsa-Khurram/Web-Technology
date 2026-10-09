import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { Brand } from "./Navbar";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div style={{ color: "#fff" }}>
              <Brand />
            </div>
            <p style={{ marginTop: 14, maxWidth: "36ch" }}>
              Curated tour packages, honest prices and real people looking after your trip from booking to return.
            </p>
            <div className="social">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer">
                <FaXTwitter />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/packages">All packages</Link>
              </li>
              <li>
                <Link to="/packages?category=Beach">Beach trips</Link>
              </li>
              <li>
                <Link to="/packages?category=Adventure">Adventure</Link>
              </li>
              <li>
                <Link to="/blog">Travel blog</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/about">About us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/my-bookings">My bookings</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Visit us</h4>
            <p style={{ margin: 0 }}>
              COMSATS University Road
              <br />
              Abbottabad, Pakistan
              <br />
              +92 300 1234567
              <br />
              hello@gotravel.com
            </p>
          </div>
        </div>
        <div className="footer-bottom row">
          <span>© {new Date().getFullYear()} GoTravel. All rights reserved.</span>
          <span className="spacer" />
          <span>Web Technology semester project</span>
        </div>
      </div>
    </footer>
  );
}
