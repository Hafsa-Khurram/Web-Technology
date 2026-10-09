const router = require("express").Router();
const Notification = require("../models/Notification");
const Coupon = require("../models/Coupon");
const Booking = require("../models/Booking");
const Package = require("../models/Package");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const { protect, allow } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");

/* ---------------- Notifications ---------------- */

router.get(
  "/notifications",
  protect,
  wrap(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unread });
  })
);

router.post(
  "/notifications/read-all",
  protect,
  wrap(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  })
);

/* ---------------- Coupons (discounts) ---------------- */

router.get(
  "/coupons",
  protect,
  allow("agent", "admin"),
  wrap(async (_req, res) => res.json({ coupons: await Coupon.find().sort({ createdAt: -1 }) }))
);

router.post(
  "/coupons",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const { code, percent, description, expiresAt } = req.body;
    const coupon = await Coupon.create({ code, percent, description, expiresAt: expiresAt || undefined });
    res.status(201).json({ coupon });
  })
);

router.patch(
  "/coupons/:id",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new HttpError(404, "Coupon not found");
    if (req.body.isActive !== undefined) coupon.isActive = Boolean(req.body.isActive);
    await coupon.save();
    res.json({ coupon });
  })
);

router.delete(
  "/coupons/:id",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  })
);

/* ---------------- Public stats (homepage) ---------------- */

router.get(
  "/stats/public",
  wrap(async (_req, res) => {
    const [packages, travelers, countries, reviews] = await Promise.all([
      Package.countDocuments({ isActive: true }),
      Booking.find({ status: { $in: ["confirmed", "completed"] } }).select("travelers").lean(),
      Package.distinct("country", { isActive: true }),
      Feedback.find().select("rating").lean(),
    ]);
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({
      packages,
      travelers: travelers.reduce((s, b) => s + b.travelers, 0),
      countries: countries.length,
      rating: Math.round(avgRating * 10) / 10,
    });
  })
);

/* ---------------- Analytics (admin + agent) ---------------- */

router.get(
  "/analytics",
  protect,
  allow("agent", "admin"),
  wrap(async (_req, res) => {
    const bookings = await Booking.find().populate("package", "title category country");
    const live = bookings.filter((b) => b.status !== "cancelled");

    const revenue = live.reduce((s, b) => s + b.total, 0);
    const collected = bookings.reduce((s, b) => s + (b.paymentStatus === "refunded" ? 0 : b.amountPaid), 0);

    const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => (byStatus[b.status] = (byStatus[b.status] || 0) + 1));

    const byPayment = { unpaid: 0, partial: 0, paid: 0, refunded: 0 };
    bookings.forEach((b) => (byPayment[b.paymentStatus] = (byPayment[b.paymentStatus] || 0) + 1));

    // Revenue for the last 6 months (by booking creation date)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "short" }),
        revenue: 0,
        bookings: 0,
      });
    }
    live.forEach((b) => {
      const d = new Date(b.createdAt);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) {
        m.revenue += b.total;
        m.bookings += 1;
      }
    });

    // Top packages
    const pkgMap = {};
    live.forEach((b) => {
      if (!b.package) return;
      const k = String(b.package._id);
      pkgMap[k] = pkgMap[k] || { title: b.package.title, bookings: 0, revenue: 0, travelers: 0 };
      pkgMap[k].bookings += 1;
      pkgMap[k].revenue += b.total;
      pkgMap[k].travelers += b.travelers;
    });
    const topPackages = Object.values(pkgMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Bookings by category
    const catMap = {};
    live.forEach((b) => {
      const c = b.package?.category || "Other";
      catMap[c] = (catMap[c] || 0) + 1;
    });

    const [customers, agents, packages, ratings] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
      Package.countDocuments({ isActive: true }),
      Feedback.find().select("rating").lean(),
    ]);
    const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

    res.json({
      totals: {
        revenue: Math.round(revenue),
        collected: Math.round(collected),
        outstanding: Math.round(
          live.reduce((s, b) => s + Math.max(b.total - b.amountPaid, 0), 0)
        ),
        bookings: bookings.length,
        travelers: live.reduce((s, b) => s + b.travelers, 0),
        customers,
        agents,
        packages,
        avgRating: Math.round(avgRating * 10) / 10,
        reviews: ratings.length,
      },
      byStatus,
      byPayment,
      monthly: months.map(({ label, revenue: r, bookings: n }) => ({ label, revenue: Math.round(r), bookings: n })),
      topPackages,
      byCategory: Object.entries(catMap).map(([name, value]) => ({ name, value })),
    });
  })
);

module.exports = router;
