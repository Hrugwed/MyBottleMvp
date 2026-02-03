const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { customerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get customer's cart
// @access  Private
router.get('/', customerAuth, getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', customerAuth, addToCart);

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemId', customerAuth, updateCartItem);

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId', customerAuth, removeFromCart);

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', customerAuth, clearCart);

module.exports = router;