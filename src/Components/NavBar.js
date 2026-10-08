import "../Assets/css/NavBar.css";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="NavBar-Container">
      <>
        <nav>
          <div className="NavBar-NavLogo">
            <Link to="#">GoTravel</Link> {/* Change a to Link */}
          </div>
          <ul className="NavBar-NavLinks">
            <li className="NavBar-Link">
              <Link to="/Travel" title="Home">
                Home
              </Link>{" "}
              {/* Change a to Link */}
            </li>
            <li className="NavBar-Link">
              <Link to="/Blog" title="Blog">
                Blog
              </Link>{" "}
              {/* Change a to Link */}
            </li>
            <li className="NavBar-Link">
              <Link to="/Offers" title="Offers">
                Offers
              </Link>{" "}
              {/* Change a to Link */}
            </li>
            <li className="NavBar-Link">
              <Link to="/Services" title="Services">
                Services
              </Link>{" "}
              {/* Change a to Link */}
            </li>
            <li className="NavBar-Link">
              <Link to="/Contacts" title="Contacts">
                Contacts
              </Link>{" "}
              {/* Change a to Link */}
            </li>
          </ul>
        </nav>
      </>
    </div>
  );
}

export default NavBar;
