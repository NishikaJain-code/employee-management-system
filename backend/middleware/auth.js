const jwt = require("jsonwebtoken");

// Middleware to verify JWT and attach user payload to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  // Handle standard 'Bearer <token>' format or plain token
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, name }
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

// Middleware to check if user has required role(s)
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Wrap single role in array for convenience
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorize
};
