import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { destCode, money } from "../api";

// Package card styled as a boarding pass
export default function PackageCard({ pkg }) {
  return (
    <Link to={`/packages/${pkg._id}`} className="ticket">
      <div className="ticket-img">
        <img src={pkg.image} alt={`${pkg.destination}, ${pkg.country}`} loading="lazy" />
        <span className="ticket-cat">{pkg.category}</span>
        {pkg.ratingCount > 0 && (
          <span className="ticket-rating">
            <FaStar size={12} /> {pkg.ratingAvg.toFixed(1)}
          </span>
        )}
      </div>
      <div className="ticket-body">
        <div className="ticket-route" aria-hidden="true">
          <span className="ticket-code">{destCode(pkg.destination)}</span>
          <span className="path">
            <MdFlight style={{ transform: "translateX(-50%) rotate(90deg)" }} />
          </span>
          <span className="days">{pkg.durationDays} days</span>
        </div>
        <h3>{pkg.title}</h3>
        <p className="ticket-place">
          {pkg.destination}, {pkg.country}
        </p>
      </div>
      <div className="ticket-tear" />
      <div className="ticket-foot">
        <span className="price">
          {money(pkg.price)}
          <small>per person</small>
        </span>
        <span className="btn btn-sm btn-ghost">View trip</span>
      </div>
    </Link>
  );
}
