const { validationResult } = require('express-validator');
const Bartender = require('../models/Bartender');
const Venue = require('../models/Venue');
const { generateToken } = require('../utils/jwt');

// @desc    Register bartender
// @route   POST /api/auth/bartender/register
// @access  Public
const registerBartender = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, venueId } = req.body;

    // Check if bartender exists
    const bartenderExists = await Bartender.findOne({ email });
    if (bartenderExists) {
      return res.status(400).json({ message: 'Bartender already exists with this email' });
    }

    // Verify venue exists and is active
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(400).json({ message: 'Invalid venue selected' });
    }

    if (!venue.isActive) {
      return res.status(400).json({ message: 'Selected venue is not active' });
    }

    // Create bartender
    const bartender = await Bartender.create({
      name,
      email,
      password,
      venue: venueId,
    });

    if (bartender) {
      // Populate venue info for response
      await bartender.populate('venue');

      const token = generateToken({
        id: bartender._id,
        userType: 'bartender'
      });

      res.status(201).json({
        success: true,
        message: 'Bartender registered successfully',
        data: {
          bartender: {
            _id: bartender._id,
            name: bartender.name,
            email: bartender.email,
            venue: bartender.venue,
            createdAt: bartender.createdAt
          },
          token,
          userType: 'bartender'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid bartender data' });
    }
  } catch (error) {
    console.error('Bartender register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login bartender
// @route   POST /api/auth/bartender/login
// @access  Public
const loginBartender = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for bartender email and include password
    const bartender = await Bartender.findOne({ email }).select('+password').populate('venue');

    if (bartender && (await bartender.comparePassword(password))) {
      const token = generateToken({
        id: bartender._id,
        userType: 'bartender'
      });

      res.json({
        success: true,
        message: 'Bartender logged in successfully',
        data: {
          bartender: {
            _id: bartender._id,
            name: bartender.name,
            email: bartender.email,
            venue: bartender.venue,
            createdAt: bartender.createdAt
          },
          token,
          userType: 'bartender'
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Bartender login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bartender profile
// @route   GET /api/auth/bartender/profile
// @access  Private (Bartender only)
const getBartenderProfile = async (req, res) => {
  try {
    const bartender = await Bartender.findById(req.user.id).populate('venue');
    res.json({
      success: true,
      data: {
        bartender: {
          _id: bartender._id,
          name: bartender.name,
          email: bartender.email,
          venue: bartender.venue,
          createdAt: bartender.createdAt,
          updatedAt: bartender.updatedAt
        },
        userType: 'bartender'
      }
    });
  } catch (error) {
    console.error('Get bartender profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout bartender
// @route   POST /api/auth/bartender/logout
// @access  Private (Bartender only)
const logoutBartender = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled on frontend
    // But we can add token blacklisting here if needed in future
    res.json({
      success: true,
      message: 'Bartender logged out successfully'
    });
  } catch (error) {
    console.error('Bartender logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all venues for registration
// @route   GET /api/auth/bartender/venues
// @access  Public
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).select('name address');
    res.json({
      success: true,
      data: venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerBartender,
  loginBartender,
  getBartenderProfile,
  logoutBartender,
  getVenues,
};