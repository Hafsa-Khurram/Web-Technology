import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Public site layout. Pages with a full-bleed photo header get a transparent navbar.
const OVER_HERO = [/^\/$/, /^\/packages\/[^/]+$/, /^\/blog$/, /^\/about$/];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const over = OVER_HERO.some((rx) => rx.test(pathname));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar overHero={over} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
