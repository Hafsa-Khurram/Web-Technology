import { useEffect } from "react";
import { FiStar, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export function Loader() {
  return (
    <div className="loader" aria-label="Loading">
      <span />
    </div>
  );
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="empty">
      {Icon && <Icon />}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Stars({ value = 0, size = 14 }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= full ? <FaStar key={i} size={size} /> : <FiStar key={i} size={size} className="off" />
      )}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className={i <= value ? "on" : ""}
          onClick={() => onChange(i)}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );
}

export function Badge({ value }) {
  return <span className={`badge b-${value}`}>{String(value).replace("-", " ")}</span>;
}

export function Modal({ title, subtitle, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="muted small">{subtitle}</div>}
          </div>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PasswordInput(props) {
  return <input className="input" type="password" autoComplete="current-password" minLength={6} {...props} />;
}
