const { verifyToken } = require('../utils/jwt');
const Customer = require('../models/Customer');
const Bartender = require('../models/Bartender');

// General auth middleware - identifies user type
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = verifyToken(token);
    
    // Check if it's a customer or bartender based on userType in token
    let user;
    if (decoded.userType === 'customer') {
      user = await Customer.findById(decoded.id);
    } else if (decoded.userType === 'bartender') {
      user = await Bartender.findById(decoded.id).populate('venue');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Customer-only middleware
const customerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.userType !== 'customer') {
        return res.status(403).json({ message: 'Customer access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};

// Bartender-only middleware
const bartenderAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.userType !== 'bartender') {
        return res.status(403).json({ message: 'Bartender access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};

module.exports = { auth, customerAuth, bartenderAuth };