const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const User = require("../models/User");
const { HttpError } = require("../utils/http");

// Verifies the Bearer token and attaches the user to req.user
async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Please log in to continue");

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      throw new HttpError(401, "Your session has expired. Please log in again");
    }

    const user = await User.findById(payload.id);
    if (!user) throw new HttpError(401, "Account no longer exists");
    if (!user.isActive) throw new HttpError(403, "Your account has been deactivated");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Restricts a route to the given roles
function allow(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to do this"));
    }
    next();
  };
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: require("../config").jwtExpiresIn,
  });
}

module.exports = { protect, allow, signToken };
