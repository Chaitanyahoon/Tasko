const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      let user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Self-healing migration for legacy users
      let needsSave = false;
      if (!user.organization) {
        const Organization = require('../models/Organization');
        let defaultOrg = await Organization.findOne({ name: 'Default Workspace' });
        if (!defaultOrg) {
          defaultOrg = await Organization.create({ name: 'Default Workspace' });
        }
        user.organization = defaultOrg._id;
        needsSave = true;
      }

      if (!user.role) {
        user.role = 'admin';
        needsSave = true;
      }

      if (needsSave) {
        await User.findByIdAndUpdate(user._id, {
          organization: user.organization,
          role: user.role,
        });
        user = await User.findById(user._id).select('-password');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
