const jwt = require("jsonwebtoken");

// There is a single admin account, configured with ADMIN_USERNAME and
// ADMIN_PASSWORD_HASH (see scripts/hashPassword.js) - no user database.
const getAdminUser = () => {
  const username = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  return {
    _id: username,
    id: username,
    username,
    role: "admin",
    fullName: username,
  };
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = getAdminUser();

    // Tokens issued to a previous admin username stop working once it changes.
    if (!admin.username || decoded.username !== admin.username) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Authorization middleware for different roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = authorizeRoles("admin");

// Admin or Editor middleware (also allow author for PDF uploads)
const requireEditor = authorizeRoles("admin", "editor", "author");

module.exports = {
  getAdminUser,
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireEditor,
};
