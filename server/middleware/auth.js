const jwt = require('jsonwebtoken');

/**
 * Reads the JWT from the httpOnly cookie, verifies it, and attaches req.user.
 * Returns 401 if missing or invalid.
 */
function authMiddleware(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'rtb_token';
  const token = req.cookies && req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory — rejects requests where req.user.role doesn't match.
 * Always used after authMiddleware.
 * @param  {...string} roles  One or more allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Middleware factory — loads a Mongoose document and checks the ownership field.
 * Stops an advertiser from editing another advertiser's resource via URL manipulation.
 *
 * @param {Model}  model      Mongoose model to query
 * @param {string} idParam    Name of the route param holding the document _id (e.g. 'id')
 * @param {string} ownerField Field on the document that stores the owner id (e.g. 'advertiserId')
 */
function requireOwnership(model, idParam, ownerField) {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params[idParam]);
      if (!doc) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      const ownerId = doc[ownerField] ? doc[ownerField].toString() : null;
      if (ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: you do not own this resource' });
      }
      // Attach doc to request so route handlers don't need to re-fetch
      req.resource = doc;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authMiddleware, requireRole, requireOwnership };
