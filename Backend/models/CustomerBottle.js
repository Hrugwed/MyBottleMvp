const mongoose = require('mongoose');

const customerBottleSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  bottleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bottle',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  selectedVolume: {
    type: String,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['full', 'emi'],
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['owned', 'consumed'],
    default: 'owned'
  }
}, {
  timestamps: true
});

// Index for efficient queries
customerBottleSchema.index({ customerId: 1, purchaseDate: -1 });

module.exports = mongoose.model('CustomerBottle', customerBottleSchema);