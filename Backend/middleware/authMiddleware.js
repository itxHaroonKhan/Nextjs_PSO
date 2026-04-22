const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // ❌ No token
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Expected format: Bearer TOKEN
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    const token = parts[1];

    // 🔐 Verify token - JWT_SECRET is required, no fallback
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET is not set in environment variables');
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const decoded = jwt.verify(token, secret);

    // Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();

  } catch (err) {
    console.error('❌ JWT Verification Error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again."
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token. Access denied."
    });
  }
};

module.exports = verifyToken;