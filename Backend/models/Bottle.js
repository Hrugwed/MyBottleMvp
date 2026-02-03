const mongoose = require('mongoose');

const bottleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  volume: {
    type: String,
    required: true,
    enum: ['180ml', '375ml', '500ml', '750ml', '1L', '1.5L']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bottle', bottleSchema);