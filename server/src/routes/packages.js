const router = require("express").Router();
const Package = require("../models/Package");
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");
const { protect, allow } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

const EDITABLE = [
  "title", "destination", "country", "category", "description", "highlights",
  "price", "durationDays", "seats", "image", "isActive",
];

function pick(body) {
  const out = {};
  for (const k of EDITABLE) if (body[k] !== undefined) out[k] = body[k];
  if (typeof out.highlights === "string") {
    out.highlights = out.highlights.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return out;
}

// Staff (agent/admin) can see inactive packages too, if they pass a valid token
function isStaff(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return false;
  try {
    const { role } = jwt.verify(h.slice(7), jwtSecret);
    return role === "agent" || role === "admin";
  } catch {
    return false;
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/packages?q=&category=&minPrice=&maxPrice=&maxDays=&sort=&all=1
router.get(
  "/",
  wrap(async (req, res) => {
    const { q, category, minPrice, maxPrice, maxDays, sort, all } = req.query;
    const filter = {};
    if (!(all && isStaff(req))) filter.isActive = true;
    if (q) {
      const rx = new RegExp(escapeRegex(String(q).trim()), "i");
      filter.$or = [{ title: rx }, { destination: rx }, { country: rx }];
    }
    if (category && category !== "All") filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxDays) filter.durationDays = { $lte: Number(maxDays) };

    const sorts = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { ratingAvg: -1, ratingCount: -1 },
      duration: { durationDays: 1 },
      newest: { createdAt: -1 },
    };
    const packages = await Package.find(filter).sort(sorts[sort] || { createdAt: -1 });
    res.json({ packages });
  })
);

// GET /api/packages/:id  (with reviews)
router.get(
  "/:id",
  wrap(async (req, res) => {
    const pkg = await Package.findById(req.params.id);
    if (!pkg || (!pkg.isActive && !isStaff(req))) throw new HttpError(404, "Package not found");
    const reviews = await Feedback.find({ package: pkg._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ package: pkg, reviews });
  })
);

// POST /api/packages  (agent/admin)
router.post(
  "/",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const pkg = await Package.create({ ...pick(req.body), createdBy: req.user._id });
    res.status(201).json({ package: pkg });
  })
);

// PUT /api/packages/:id  (agent/admin)
router.put(
  "/:id",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const pkg = await Package.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!pkg) throw new HttpError(404, "Package not found");
    res.json({ package: pkg });
  })
);

// DELETE /api/packages/:id  (agent/admin)
// Packages with bookings are archived (hidden) instead of deleted so history is kept.
router.delete(
  "/:id",
  protect,
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) throw new HttpError(404, "Package not found");
    const hasBookings = await Booking.exists({ package: pkg._id });
    if (hasBookings) {
      pkg.isActive = false;
      await pkg.save();
      return res.json({ archived: true, message: "Package has bookings, so it was archived (hidden) instead of deleted" });
    }
    await pkg.deleteOne();
    res.json({ deleted: true, message: "Package deleted" });
  })
);

module.exports = router;
