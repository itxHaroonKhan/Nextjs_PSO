const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const bearer = req.headers['authorization'];

  if (!bearer) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!bearer.startsWith('Bearer ') || bearer.split(' ').length !== 2) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = bearer.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;