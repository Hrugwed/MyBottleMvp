const Customer = require('../models/Customer');
const Bottle = require('../models/Bottle');
const Venue = require('../models/Venue');

// @desc    Get customer's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id)
      .populate({
        path: 'cart.bottleId',
        select: 'name brand price volume isAvailable'
      })
      .populate({
        path: 'cart.venueId',
        select: 'name address'
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    let originalPrice = 0;

    const cartItems = customer.cart.map(item => {
      const itemTotal = item.bottleId.price * item.quantity;
      const itemOriginal = Math.floor(item.bottleId.price * 1.2) * item.quantity; // Assuming 20% markup for MRP
      
      totalItems += item.quantity;
      totalPrice += itemTotal;
      originalPrice += itemOriginal;

      return {
        _id: item._id,
        bottle: item.bottleId,
        quantity: item.quantity,
        venue: item.venueId,
        selectedVolume: item.selectedVolume || item.bottleId.volume,
        addedAt: item.addedAt,
        itemTotal,
        itemOriginal
      };
    });

    const savings = originalPrice - totalPrice;

    res.json({
      success: true,
      data: {
        items: cartItems,
        summary: {
          totalItems,
          totalPrice,
          originalPrice,
          savings
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { bottleId, venueId, quantity = 1, selectedVolume } = req.body;

    // Validate bottle exists and is available
    const bottle = await Bottle.findById(bottleId);
    if (!bottle) {
      return res.status(404).json({
        success: false,
        message: 'Bottle not found'
      });
    }

    if (!bottle.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Bottle is not available'
      });
    }

    // Validate venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = customer.cart.findIndex(
      item => item.bottleId.toString() === bottleId && 
               item.venueId.toString() === venueId &&
               item.selectedVolume === (selectedVolume || bottle.volume)
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      customer.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      customer.cart.push({
        bottleId,
        venueId,
        quantity,
        selectedVolume: selectedVolume || bottle.volume,
        addedAt: new Date()
      });
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      cartCount: customer.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const cartItem = customer.cart.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = quantity;
    await customer.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      cartCount: customer.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const cartItem = customer.cart.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.deleteOne();
    await customer.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      cartCount: customer.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.cart = [];
    await customer.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cartCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};