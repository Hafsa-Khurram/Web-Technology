const router = require("express").Router();
const Booking = require("../models/Booking");
const Package = require("../models/Package");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { protect, allow } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");
const { notify } = require("../utils/notify");

const STAFF = ["agent", "admin"];
const isStaff = (u) => STAFF.includes(u.role);

const populate = (q) =>
  q.populate("package", "title destination country image durationDays price").populate("user", "name email phone");

async function loadBooking(req) {
  const booking = await populate(Booking.findById(req.params.id));
  if (!booking) throw new HttpError(404, "Booking not found");
  if (!isStaff(req.user) && String(booking.user._id) !== String(req.user._id)) {
    throw new HttpError(404, "Booking not found");
  }
  return booking;
}

function money(n) {
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

async function seatsTaken(packageId, travelDate, excludeId) {
  const start = new Date(travelDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const rows = await Booking.find({
    package: packageId,
    travelDate: { $gte: start, $lt: end },
    status: { $in: ["pending", "confirmed"] },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("travelers");
  return rows.reduce((s, b) => s + b.travelers, 0);
}

// POST /api/bookings/validate-coupon  { code }
router.post(
  "/validate-coupon",
  protect,
  wrap(async (req, res) => {
    const code = String(req.body.code || "").toUpperCase().trim();
    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isUsable()) throw new HttpError(404, "This promo code is invalid or expired");
    res.json({ code: coupon.code, percent: coupon.percent, description: coupon.description });
  })
);

// POST /api/bookings  (customer books a package)
router.post(
  "/",
  protect,
  wrap(async (req, res) => {
    const { packageId, travelers, travelDate, contactPhone, notes, couponCode } = req.body;
    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) throw new HttpError(404, "This package is not available");

    const count = Number(travelers);
    if (!Number.isInteger(count) || count < 1 || count > 20) throw new HttpError(400, "Travellers must be between 1 and 20");

    const date = new Date(travelDate);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (Number.isNaN(date.getTime()) || date < tomorrow) throw new HttpError(400, "Please choose a travel date from tomorrow onwards");

    const taken = await seatsTaken(pkg._id, date);
    if (taken + count > pkg.seats) {
      throw new HttpError(400, `Only ${Math.max(pkg.seats - taken, 0)} seat(s) left on this date`);
    }

    let discountPercent = 0;
    let discountCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim() });
      if (!coupon || !coupon.isUsable()) throw new HttpError(400, "This promo code is invalid or expired");
      discountPercent = coupon.percent;
      discountCode = coupon.code;
    }

    const booking = new Booking({
      user: req.user._id,
      package: pkg._id,
      travelers: count,
      travelDate: date,
      contactPhone: contactPhone || req.user.phone,
      notes,
      unitPrice: pkg.price,
      subtotal: 0,
      total: 0,
      discountCode,
      discountPercent,
    });
    booking.recalculate();
    await booking.save();

    await notify(req.user, {
      title: "Booking received",
      message: `Your booking ${booking.bookingRef} for "${pkg.title}" (${count} traveller${count > 1 ? "s" : ""}) has been received. Total: ${money(booking.total)}. Our agent will confirm it shortly.`,
      link: "/my-bookings",
    });

    // Let staff know
    const staff = await User.find({ role: { $in: STAFF }, isActive: true });
    await Promise.all(
      staff.map((s) =>
        notify({ _id: s._id }, {
          title: "New booking",
          message: `${req.user.name} booked "${pkg.title}" for ${count} (${booking.bookingRef}).`,
          link: "/agent/bookings",
        })
      )
    );

    res.status(201).json({ booking: await populate(Booking.findById(booking._id)) });
  })
);

// GET /api/bookings/mine
router.get(
  "/mine",
  protect,
  wrap(async (req, res) => {
    const bookings = await populate(Booking.find({ user: req.user._id }).sort({ createdAt: -1 }));
    res.json({ bookings });
  })
);

// GET /api/bookings  (agent/admin, with filters)
router.get(
  "/",
  protect,
  allow(...STAFF),
  wrap(async (req, res) => {
    const { status, paymentStatus, q } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (paymentStatus && paymentStatus !== "all") filter.paymentStatus = paymentStatus;
    let bookings = await populate(Booking.find(filter).sort({ createdAt: -1 }));
    if (q) {
      const s = String(q).toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.bookingRef.toLowerCase().includes(s) ||
          b.user?.name?.toLowerCase().includes(s) ||
          b.user?.email?.toLowerCase().includes(s) ||
          b.package?.title?.toLowerCase().includes(s)
      );
    }
    res.json({ bookings });
  })
);

// GET /api/bookings/:id
router.get(
  "/:id",
  protect,
  wrap(async (req, res) => res.json({ booking: await loadBooking(req) }))
);

// PATCH /api/bookings/:id  (agent/admin modify booking: status, travellers, date, notes)
router.patch(
  "/:id",
  protect,
  allow(...STAFF),
  wrap(async (req, res) => {
    const booking = await loadBooking(req);
    const { status, travelers, travelDate, notes, contactPhone } = req.body;
    const before = booking.status;

    if (travelers !== undefined) {
      const n = Number(travelers);
      if (!Number.isInteger(n) || n < 1 || n > 20) throw new HttpError(400, "Travellers must be between 1 and 20");
      booking.travelers = n;
    }
    if (travelDate) {
      const d = new Date(travelDate);
      if (Number.isNaN(d.getTime())) throw new HttpError(400, "Invalid travel date");
      booking.travelDate = d;
    }
    if (notes !== undefined) booking.notes = notes;
    if (contactPhone !== undefined) booking.contactPhone = contactPhone;
    if (status) {
      if (!Booking.STATUSES.includes(status)) throw new HttpError(400, "Invalid status");
      booking.status = status;
      if (status === "cancelled") booking.cancelledAt = new Date();
    }

    if (travelers !== undefined || travelDate) {
      const pkg = await Package.findById(booking.package._id);
      const taken = await seatsTaken(pkg._id, booking.travelDate, booking._id);
      if (["pending", "confirmed"].includes(booking.status) && taken + booking.travelers > pkg.seats) {
        throw new HttpError(400, `Only ${Math.max(pkg.seats - taken, 0)} seat(s) left on that date`);
      }
    }

    booking.recalculate();
    await booking.save();

    const customer = booking.user;
    if (status && status !== before) {
      const msgs = {
        confirmed: `Great news! Your booking ${booking.bookingRef} for "${booking.package.title}" is confirmed for ${booking.travelDate.toDateString()}.`,
        cancelled: `Your booking ${booking.bookingRef} for "${booking.package.title}" has been cancelled.`,
        completed: `We hope you enjoyed "${booking.package.title}"! Please rate your trip and leave feedback.`,
        pending: `Your booking ${booking.bookingRef} is pending review again.`,
      };
      await notify(customer, {
        title: `Booking ${status}`,
        message: msgs[status],
        link: "/my-bookings",
      });
    } else if (travelers !== undefined || travelDate) {
      await notify(customer, {
        title: "Booking updated",
        message: `Your booking ${booking.bookingRef} was updated: ${booking.travelers} traveller(s) on ${booking.travelDate.toDateString()}. New total ${money(booking.total)}.`,
        link: "/my-bookings",
      });
    }

    res.json({ booking });
  })
);

// POST /api/bookings/:id/cancel  (customer cancels own pending/confirmed booking)
router.post(
  "/:id/cancel",
  protect,
  wrap(async (req, res) => {
    const booking = await loadBooking(req);
    if (!["pending", "confirmed"].includes(booking.status)) {
      throw new HttpError(400, `A ${booking.status} booking cannot be cancelled`);
    }
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();
    await notify(booking.user, {
      title: "Booking cancelled",
      message: `Your booking ${booking.bookingRef} for "${booking.package.title}" has been cancelled.`,
      link: "/my-bookings",
    });
    res.json({ booking });
  })
);

// POST /api/bookings/:id/payments  (agent/admin records a payment)
router.post(
  "/:id/payments",
  protect,
  allow(...STAFF),
  wrap(async (req, res) => {
    const booking = await loadBooking(req);
    if (booking.status === "cancelled") throw new HttpError(400, "Cannot take payment for a cancelled booking");
    const amount = Number(req.body.amount);
    if (!(amount > 0)) throw new HttpError(400, "Enter a payment amount greater than 0");
    const remaining = booking.total - booking.amountPaid;
    if (amount > remaining + 0.001) throw new HttpError(400, `Amount exceeds the balance due (${money(remaining)})`);
    const method = req.body.method || "cash";
    if (!Booking.PAYMENT_METHODS.includes(method)) throw new HttpError(400, "Invalid payment method");

    booking.payments.push({ amount, method, reference: req.body.reference || "", recordedBy: req.user._id });
    booking.recalculate();
    await booking.save();

    await notify(booking.user, {
      title: "Payment received",
      message: `We received ${money(amount)} for booking ${booking.bookingRef}. Balance due: ${money(booking.total - booking.amountPaid)}.`,
      link: "/my-bookings",
    });
    res.json({ booking });
  })
);

// POST /api/bookings/:id/refund  (agent/admin marks a cancelled booking as refunded)
router.post(
  "/:id/refund",
  protect,
  allow(...STAFF),
  wrap(async (req, res) => {
    const booking = await loadBooking(req);
    if (booking.status !== "cancelled") throw new HttpError(400, "Only cancelled bookings can be refunded");
    if (booking.amountPaid <= 0) throw new HttpError(400, "Nothing has been paid on this booking");
    booking.paymentStatus = "refunded";
    await booking.save();
    await notify(booking.user, {
      title: "Refund processed",
      message: `A refund of ${money(booking.amountPaid)} for booking ${booking.bookingRef} has been processed.`,
      link: "/my-bookings",
    });
    res.json({ booking });
  })
);

// PATCH /api/bookings/:id/discount  { percent, code }  (agent/admin)
router.patch(
  "/:id/discount",
  protect,
  allow(...STAFF),
  wrap(async (req, res) => {
    const booking = await loadBooking(req);
    const percent = Number(req.body.percent);
    if (!(percent >= 0 && percent <= 90)) throw new HttpError(400, "Discount must be between 0% and 90%");
    booking.discountPercent = percent;
    booking.discountCode = percent > 0 ? String(req.body.code || "AGENT").toUpperCase() : "";
    booking.recalculate();
    if (booking.amountPaid > booking.total + 0.001) {
      throw new HttpError(400, "Discount would make the total lower than what has already been paid");
    }
    await booking.save();
    res.json({ booking });
  })
);

module.exports = router;
