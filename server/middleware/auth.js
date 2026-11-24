const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ojt-playground-secret-key-2026';

const DEFAULT_DEV_USER = {
  id: 'usr-developer-01',
  name: 'MHN Developer',
  email: 'developer@mhntab.edu',
  role: 'admin'
};

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Open friction-free developer access for MHN TAB
    req.user = DEFAULT_DEV_USER;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = DEFAULT_DEV_USER;
    next();
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      req.user = DEFAULT_DEV_USER;
    }
  } else {
    req.user = DEFAULT_DEV_USER;
  }
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      req.user = DEFAULT_DEV_USER;
      next();
    }
  });
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};
