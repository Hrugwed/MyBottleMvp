const express = require('express');
const {
  registerBartender,
  loginBartender,
  getBartenderProfile,
  logoutBartender,
  getVenues,
} = require('../controllers/bartenderAuthController');
const { bartenderAuth } = require('../middleware/auth');
const {
  bartenderRegisterValidation,
  bartenderLoginValidation,
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/venues', getVenues);
router.post('/register', bartenderRegisterValidation, registerBartender);
router.post('/login', bartenderLoginValidation, loginBartender);

// Protected routes (Bartender only)
router.get('/profile', bartenderAuth, getBartenderProfile);
router.post('/logout', bartenderAuth, logoutBartender);

module.exports = router;