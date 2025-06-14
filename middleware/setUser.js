// middleware/setUser.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const setUser = async (req, res, next) => {
  const token = req.cookies.token;
  res.locals.user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('first_name last_name email');

      if (user) {
        res.locals.user = user;
      }
      
    } catch (err) {
        if (err.name !== 'TokenExpiredError') {
            console.warn('Invalid token in setUser middleware:', err.message);
          }
    }
  }

  next();
};

module.exports = setUser;
