const router = require("express").Router();
const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const { protect, allow } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");

// GET /api/feedback/latest  (public, for homepage testimonials)
router.get(
  "/latest",
  wrap(async (_req, res) => {
    const reviews = await Feedback.find({ rating: { $gte: 4 }, comment: { $ne: "" } })
      .populate("user", "name")
      .populate("package", "title destination")
      .sort({ createdAt: -1 })
      .limit(6);
    res.json({ reviews });
  })
);

// POST /api/feedback  { bookingId, rating, comment }
router.post(
  "/",
  protect,
  wrap(async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || String(booking.user) !== String(req.user._id)) throw new HttpError(404, "Booking not found");
    if (!["confirmed", "completed"].includes(booking.status)) {
      throw new HttpError(400, "You can rate a trip once the booking is confirmed or completed");
    }
    if (new Date(booking.travelDate) > new Date() && booking.status !== "completed") {
      throw new HttpError(400, "You can leave feedback after your trip date");
    }
    const r = Number(rating);
    if (!(r >= 1 && r <= 5)) throw new HttpError(400, "Rating must be 1 to 5 stars");

    const exists = await Feedback.findOne({ booking: booking._id });
    if (exists) throw new HttpError(409, "You have already reviewed this booking");

    const fb = await Feedback.create({
      user: req.user._id,
      package: booking.package,
      booking: booking._id,
      rating: Math.round(r),
      comment,
    });
    booking.feedbackGiven = true;
    await booking.save();
    await Feedback.refreshPackageRating(booking.package);
    res.status(201).json({ feedback: fb });
  })
);

// GET /api/feedback  (agent/admin: all feedback)
router.get(
  "/",
  protect,
  allow("agent", "admin"),
  wrap(async (_req, res) => {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .populate("package", "title")
      .sort({ createdAt: -1 });
    res.json({ feedback });
  })
);

// DELETE /api/feedback/:id  (admin moderation)
router.delete(
  "/:id",
  protect,
  allow("admin"),
  wrap(async (req, res) => {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) throw new HttpError(404, "Feedback not found");
    await fb.deleteOne();
    await Booking.findByIdAndUpdate(fb.booking, { feedbackGiven: false });
    await Feedback.refreshPackageRating(fb.package);
    res.json({ deleted: true });
  })
);

module.exports = router;
