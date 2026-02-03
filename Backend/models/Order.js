const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bottleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bottle',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
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
  priceAtPurchase: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['full', 'emi'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed' // For now, we'll mark as completed immediately
  },
  emiDetails: {
    monthlyAmount: {
      type: Number,
      required: function() { return this.paymentMethod === 'emi'; }
    },
    totalMonths: {
      type: Number,
      default: 12,
      required: function() { return this.paymentMethod === 'emi'; }
    },
    remainingMonths: {
      type: Number,
      required: function() { return this.paymentMethod === 'emi'; }
    }
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'delivered'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);