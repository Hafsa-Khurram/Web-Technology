import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader } from "./components/ui";
import SiteLayout from "./components/SiteLayout";
import { GuestOnly, RequireAuth } from "./components/Guards";
import Home from "./pages/Home";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import Blog from "./pages/Blog";
import { About, Contact, NotFound } from "./pages/Info";
import { Login, Register } from "./pages/Auth";
import { Invoice, MyBookings, Notifications, Profile } from "./pages/Account";

// Staff portal is loaded on demand so customers download less JavaScript
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const Bookings = lazy(() => import("./pages/dashboard/Bookings"));
const AdminPackages = lazy(() => import("./pages/dashboard/Packages"));
const Discounts = lazy(() => import("./pages/dashboard/Manage").then((m) => ({ default: m.Discounts })));
const Users = lazy(() => import("./pages/dashboard/Manage").then((m) => ({ default: m.Users })));
const Reviews = lazy(() => import("./pages/dashboard/Manage").then((m) => ({ default: m.Reviews })));

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:id" element={<PackageDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="invoice/:id" element={<RequireAuth><Invoice /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route
        path="dashboard"
        element={
          <RequireAuth roles={["agent", "admin"]}>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
