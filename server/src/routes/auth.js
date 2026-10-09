const router = require("express").Router();
const User = require("../models/User");
const { protect, signToken } = require("../middleware/auth");
const { wrap, HttpError } = require("../utils/http");

// POST /api/auth/register  (public sign-up always creates a customer)
router.post(
  "/register",
  wrap(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) throw new HttpError(400, "Name, email and password are required");
    if (String(password).length < 6) throw new HttpError(400, "Password must be at least 6 characters");

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) throw new HttpError(409, "An account with this email already exists");

    const user = await User.create({ name, email, password, phone, role: "customer" });
    res.status(201).json({ token: signToken(user), user });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpError(401, "Incorrect email or password");
    }
    if (!user.isActive) throw new HttpError(403, "Your account has been deactivated. Contact support.");

    res.json({ token: signToken(user), user });
  })
);

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json({ user: req.user }));

// PATCH /api/auth/me  (update own profile / password)
router.patch(
  "/me",
  protect,
  wrap(async (req, res) => {
    const user = await User.findById(req.user._id).select("+password");
    const { name, phone, currentPassword, newPassword } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (newPassword) {
      if (!currentPassword || !(await user.comparePassword(currentPassword))) {
        throw new HttpError(400, "Current password is incorrect");
      }
      if (String(newPassword).length < 6) throw new HttpError(400, "New password must be at least 6 characters");
      user.password = newPassword;
    }
    await user.save();
    res.json({ user });
  })
);

module.exports = router;
