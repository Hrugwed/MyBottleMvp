const Venue = require('../models/Venue');
const Bottle = require('../models/Bottle');

// @desc    Get all venues with bottle counts
// @route   GET /api/venues
// @access  Public
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'bottles',
          localField: '_id',
          foreignField: 'venue',
          as: 'bottles'
        }
      },
      {
        $addFields: {
          bottleCount: { $size: '$bottles' },
          availableBottles: {
            $size: {
              $filter: {
                input: '$bottles',
                cond: { $eq: ['$$this.isAvailable', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          isActive: 1,
          bottleCount: 1,
          availableBottles: 1,
          createdAt: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get venue by ID with basic info
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ 
        success: false,
        message: 'Venue not found' 
      });
    }

    // Get bottle statistics for this venue
    const bottleStats = await Bottle.aggregate([
      { $match: { venue: venue._id } },
      {
        $group: {
          _id: null,
          totalBottles: { $sum: 1 },
          availableBottles: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          },
          totalStock: { $sum: '$amount' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    const stats = bottleStats[0] || {
      totalBottles: 0,
      availableBottles: 0,
      totalStock: 0,
      averagePrice: 0
    };

    res.json({
      success: true,
      data: {
        venue,
        stats
      }
    });
  } catch (error) {
    console.error('Get venue error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Venue not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get all bottles for a specific venue
// @route   GET /api/venues/:id/bottles
// @access  Public
const getVenueBottles = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      sortBy = 'name',
      sortOrder = 'asc',
      available = ''
    } = req.query;

    // Check if venue exists
    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({ 
        success: false,
        message: 'Venue not found' 
      });
    }

    // Build query
    const query = { venue: id };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Add availability filter
    if (available === 'true') {
      query.isAvailable = true;
    } else if (available === 'false') {
      query.isAvailable = false;
    }

    // Add category filter (you can extend this based on bottle categories)
    if (category) {
      query.brand = { $regex: category, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const bottles = await Bottle.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('venue', 'name address');

    // Get total count for pagination
    const total = await Bottle.countDocuments(query);

    res.json({
      success: true,
      data: bottles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      venue: {
        _id: venue._id,
        name: venue.name,
        address: venue.address
      }
    });
  } catch (error) {
    console.error('Get venue bottles error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Venue not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get bottle by ID
// @route   GET /api/venues/:venueId/bottles/:bottleId
// @access  Public
const getBottleById = async (req, res) => {
  try {
    const { venueId, bottleId } = req.params;

    const bottle = await Bottle.findOne({ 
      _id: bottleId, 
      venue: venueId 
    }).populate('venue', 'name address');

    if (!bottle) {
      return res.status(404).json({ 
        success: false,
        message: 'Bottle not found' 
      });
    }

    res.json({
      success: true,
      data: bottle
    });
  } catch (error) {
    console.error('Get bottle error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Bottle not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  getVenueBottles,
  getBottleById
};