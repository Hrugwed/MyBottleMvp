const Customer = require('../models/Customer');
const Order = require('../models/Order');
const CustomerBottle = require('../models/CustomerBottle');
const Bottle = require('../models/Bottle');
const Venue = require('../models/Venue');

// @desc    Process payment and create order
// @route   POST /api/payment/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body; // 'full' or 'emi'
    
    if (!['full', 'emi'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Get customer with populated cart
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

    if (customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all bottles are still available
    for (const cartItem of customer.cart) {
      if (!cartItem.bottleId.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${cartItem.bottleId.name} is no longer available`
        });
      }
    }

    // Calculate total amount
    const totalAmount = customer.cart.reduce((sum, item) => {
      return sum + (item.bottleId.price * item.quantity);
    }, 0);

    // Prepare order items
    const orderItems = customer.cart.map(item => ({
      bottleId: item.bottleId._id,
      quantity: item.quantity,
      venueId: item.venueId._id,
      selectedVolume: item.selectedVolume || item.bottleId.volume,
      priceAtPurchase: item.bottleId.price,
      totalPrice: item.bottleId.price * item.quantity
    }));

    // Create order
    const orderData = {
      customerId: customer._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed', // For now, mark as completed immediately
      orderStatus: 'confirmed'
    };

    // Add EMI details if payment method is EMI
    if (paymentMethod === 'emi') {
      const monthlyAmount = Math.ceil(totalAmount / 12);
      orderData.emiDetails = {
        monthlyAmount,
        totalMonths: 12,
        remainingMonths: 12
      };
    }

    const order = new Order(orderData);
    await order.save();

    // Create customer bottle records (each bottle separately, even if same type)
    const customerBottles = [];
    for (const cartItem of customer.cart) {
      // Create separate records for each quantity
      for (let i = 0; i < cartItem.quantity; i++) {
        customerBottles.push({
          customerId: customer._id,
          bottleId: cartItem.bottleId._id,
          orderId: order._id,
          venueId: cartItem.venueId._id,
          selectedVolume: cartItem.selectedVolume || cartItem.bottleId.volume,
          purchasePrice: cartItem.bottleId.price,
          paymentMethod,
          purchaseDate: new Date(),
          status: 'owned'
        });
      }
    }

    await CustomerBottle.insertMany(customerBottles);

    // Clear the cart
    customer.cart = [];
    await customer.save();

    // Populate order for response
    await order.populate([
      {
        path: 'items.bottleId',
        select: 'name brand price volume'
      },
      {
        path: 'items.venueId',
        select: 'name address'
      }
    ]);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        bottlesOwned: customerBottles.length,
        totalAmount
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};

// @desc    Get customer's owned bottles
// @route   GET /api/payment/my-bottles
// @access  Private
const getMyBottles = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'owned' } = req.query;
    
    const customerBottles = await CustomerBottle.find({
      customerId: req.user.id,
      status
    })
    .populate({
      path: 'bottleId',
      select: 'name brand price volume'
    })
    .populate({
      path: 'venueId',
      select: 'name address'
    })
    .populate({
      path: 'orderId',
      select: 'paymentMethod emiDetails createdAt'
    })
    .sort({ purchaseDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalBottles = await CustomerBottle.countDocuments({
      customerId: req.user.id,
      status
    });

    // Group by purchase date for better UI organization
    const bottlesByDate = {};
    customerBottles.forEach(bottle => {
      const dateKey = bottle.purchaseDate.toDateString();
      if (!bottlesByDate[dateKey]) {
        bottlesByDate[dateKey] = [];
      }
      bottlesByDate[dateKey].push(bottle);
    });

    res.json({
      success: true,
      data: {
        bottles: customerBottles,
        bottlesByDate,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBottles / limit),
          totalBottles,
          hasNext: page * limit < totalBottles,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my bottles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get customer's order history
// @route   GET /api/payment/orders
// @access  Private
const getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ customerId: req.user.id })
      .populate([
        {
          path: 'items.bottleId',
          select: 'name brand price volume'
        },
        {
          path: 'items.venueId',
          select: 'name address'
        }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments({ customerId: req.user.id });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  processPayment,
  getMyBottles,
  getOrderHistory
};