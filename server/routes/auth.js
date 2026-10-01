const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const { authenticateToken, getAdminUser } = require("../middleware/auth");

const router = express.Router();

// Slow down password guessing against the single admin account.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again later." },
});

// Login validation rules
const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const signToken = (user) =>
  jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  fullName: user.fullName,
});

// @route   POST /api/auth/login
// @desc    Login as the admin (credentials come from env, not a database)
// @access  Public
router.post("/login", loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const admin = getAdminUser();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!admin.username || !passwordHash) {
      console.error("❌ ADMIN_USERNAME / ADMIN_PASSWORD_HASH are not configured");
      return res.status(500).json({
        success: false,
        message: "Admin login is not configured on the server",
      });
    }

    const { username, password } = req.body;
    const usernameMatches = username.trim().toLowerCase() === admin.username;
    // Always run bcrypt so a wrong username takes as long as a wrong password.
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: signToken(admin),
      user: publicUser(admin),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticateToken, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post("/refresh", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Token refreshed successfully",
    token: signToken(req.user),
  });
});

module.exports = router;
