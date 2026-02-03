const express = require('express');
const {
  getAllVenues,
  getVenueById,
  getVenueBottles,
  getBottleById
} = require('../controllers/venueController');

const router = express.Router();

// @route   GET /api/venues
// @desc    Get all venues with bottle counts
// @access  Public
router.get('/', getAllVenues);

// @route   GET /api/venues/:id
// @desc    Get venue by ID with stats
// @access  Public
router.get('/:id', getVenueById);

// @route   GET /api/venues/:id/bottles
// @desc    Get all bottles for a specific venue
// @access  Public
router.get('/:id/bottles', getVenueBottles);

// @route   GET /api/venues/:venueId/bottles/:bottleId
// @desc    Get specific bottle from a venue
// @access  Public
router.get('/:venueId/bottles/:bottleId', getBottleById);

module.exports = router;