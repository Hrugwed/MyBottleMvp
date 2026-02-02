const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { generateToken } = require('../utils/jwt');

// @desc    Register customer
// @route   POST /api/auth/customer/register
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if customer exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: 'Customer already exists with this email' });
    }

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      password,
    });

    if (customer) {
      const token = generateToken({
        id: customer._id,
        userType: 'customer'
      });

      res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        data: {
          customer: {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            createdAt: customer.createdAt
          },
          token,
          userType: 'customer'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid customer data' });
    }
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login customer
// @route   POST /api/auth/customer/login
// @access  Public
const loginCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for customer email and include password
    const customer = await Customer.findOne({ email }).select('+password');

    if (customer && (await customer.comparePassword(password))) {
      const token = generateToken({
        id: customer._id,
        userType: 'customer'
      });

      res.json({
        success: true,
        message: 'Customer logged in successfully',
        data: {
          customer: {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            createdAt: customer.createdAt
          },
          token,
          userType: 'customer'
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer profile
// @route   GET /api/auth/customer/profile
// @access  Private (Customer only)
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    res.json({
      success: true,
      data: {
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        },
        userType: 'customer'
      }
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout customer
// @route   POST /api/auth/customer/logout
// @access  Private (Customer only)
const logoutCustomer = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled on frontend
    // But we can add token blacklisting here if needed in future
    res.json({
      success: true,
      message: 'Customer logged out successfully'
    });
  } catch (error) {
    console.error('Customer logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer,
};