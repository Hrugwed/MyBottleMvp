const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer,
} = require('../controllers/customerAuthController');
const { customerAuth } = require('../middleware/auth');
const {
  customerRegisterValidation,
  customerLoginValidation,
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', customerRegisterValidation, registerCustomer);
router.post('/login', customerLoginValidation, loginCustomer);

// Protected routes (Customer only)
router.get('/profile', customerAuth, getCustomerProfile);
router.post('/logout', customerAuth, logoutCustomer);

module.exports = router;