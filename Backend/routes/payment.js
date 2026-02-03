const express = require('express');
const router = express.Router();
const { customerAuth } = require('../middleware/auth');
const {
  processPayment,
  getMyBottles,
  getOrderHistory
} = require('../controllers/paymentController');

// @route   POST /api/payment/process
// @desc    Process payment and create order
// @access  Private
router.post('/process', customerAuth, processPayment);

// @route   GET /api/payment/my-bottles
// @desc    Get customer's owned bottles
// @access  Private
router.get('/my-bottles', customerAuth, getMyBottles);

// @route   GET /api/payment/orders
// @desc    Get customer's order history
// @access  Private
router.get('/orders', customerAuth, getOrderHistory);

module.exports = router;

module.exports = router;