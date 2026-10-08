import "../Assets/css/Travel.css";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

function Travel() {
  return (
    <div className="Travel-Container" style={{ width: "100vw" }}>
      <>
        <NavBar />
        <header>
          <div className="Travel-SectionContainer">
            <div className="Travel-HeaderContent">
              <h1>Travel</h1>
              <p>
                Embark on a journey of a lifetime and explore the world's most
                breathtaking destinations with our expert travel advice. From
                exotic beaches to cultural wonders, we've got you covered with
                our comprehensive travel guides and insider tips.
              </p>
              <div className="Travel-button-container">
                <Link to="/Login" title="Login" className="btn Travel-btn">
                  Login
                </Link>{" "}
                {/* Change a to Link */}
                <Link
                  to="/Register"
                  title="Register"
                  className="btn Travel-btn"
                >
                  Register
                </Link>{" "}
                {/* Change a to Link */}
              </div>
            </div>
          </div>
        </header>
      </>
    </div>
  );
}

export default Travel;
