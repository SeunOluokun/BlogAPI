const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = (options = { required: false }) => {
  return async (req, res, next) => {
    const token = req.cookies.token;
    res.locals.user = null;

    if (!token) {
      if (options.required) {
        return res.redirect('/login'); // or res.status(401).json({ error: 'No token' });
      } else {
        return next(); // no token, but not required
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('first_name last_name email');

      if (!user) {
        throw new Error('User not found');
      }

      req.user = decoded;
      res.locals.user = user;
      next();
    } catch (err) {
      console.warn('Token verification failed:', err.message);
      if (options.required) {
        return res.redirect('/login'); // or return res.status(403).json({ error: 'Invalid token' });
      } else {
        next(); // let views still load without user
      }
    }
  };
};
module.exports = authMiddleware;
