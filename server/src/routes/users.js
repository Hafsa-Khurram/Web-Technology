const router = require("express").Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const { protect, allow } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");

router.use(protect);

// GET /api/users?role=&q=   (admin: everyone, agent: customers only)
router.get(
  "/",
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const filter = {};
    if (req.user.role === "agent") filter.role = "customer";
    else if (req.query.role && req.query.role !== "all") filter.role = req.query.role;
    if (req.query.q) {
      const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    const all = await Booking.find().select("user").lean();
    const map = {};
    all.forEach((b) => (map[String(b.user)] = (map[String(b.user)] || 0) + 1));
    res.json({ users: users.map((u) => ({ ...u.toJSON(), bookingCount: map[String(u._id)] || 0 })) });
  })
);

// POST /api/users  (admin creates customer/agent/admin accounts)
router.post(
  "/",
  allow("admin"),
  wrap(async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) throw new HttpError(400, "Name, email and password are required");
    if (role && !User.ROLES.includes(role)) throw new HttpError(400, "Invalid role");
    const user = await User.create({ name, email, password, phone, role: role || "customer" });
    res.status(201).json({ user });
  })
);

// PATCH /api/users/:id  (agent: edit customer details; admin: also role/active)
router.patch(
  "/:id",
  allow("agent", "admin"),
  wrap(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    if (req.user.role === "agent" && user.role !== "customer") throw new HttpError(403, "Agents can only edit customers");

    const { name, phone, email, role, isActive, password } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;

    if (req.user.role === "admin") {
      const self = String(user._id) === String(req.user._id);
      if (role !== undefined) {
        if (!User.ROLES.includes(role)) throw new HttpError(400, "Invalid role");
        if (self && role !== "admin") throw new HttpError(400, "You cannot remove your own admin role");
        user.role = role;
      }
      if (isActive !== undefined) {
        if (self && !isActive) throw new HttpError(400, "You cannot deactivate yourself");
        user.isActive = Boolean(isActive);
      }
      if (password) user.password = password;
    }
    await user.save();
    res.json({ user });
  })
);

// DELETE /api/users/:id  (admin)
router.delete(
  "/:id",
  allow("admin"),
  wrap(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) throw new HttpError(400, "You cannot delete your own account");
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    const active = await Booking.exists({ user: user._id, status: { $in: ["pending", "confirmed"] } });
    if (active) throw new HttpError(400, "This user has active bookings. Cancel them or deactivate the account instead.");
    await user.deleteOne();
    res.json({ deleted: true });
  })
);

module.exports = router;
