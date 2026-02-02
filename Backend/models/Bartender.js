const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bartenderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  }
}, {
  timestamps: true
});

// Hash password before saving
bartenderSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
bartenderSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
bartenderSchema.methods.toJSON = function() {
  const bartenderObject = this.toObject();
  delete bartenderObject.password;
  return bartenderObject;
};

module.exports = mongoose.model('Bartender', bartenderSchema);