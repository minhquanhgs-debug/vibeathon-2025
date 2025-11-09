const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'provider', 'patient'],
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true
  },
  // Provider-specific fields
  specialty: {
    type: String,
    trim: true
  },
  npiNumber: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  // Patient-specific fields
  dateOfBirth: {
    type: Date
  },
  insuranceProvider: {
    type: String,
    trim: true
  },
  insuranceId: {
    type: String,
    trim: true
  },
  primaryCareProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    phone: this.phone,
    specialty: this.specialty,
    npiNumber: this.npiNumber,
    organization: this.organization,
    location: this.location,
    dateOfBirth: this.dateOfBirth,
    insuranceProvider: this.insuranceProvider,
    insuranceId: this.insuranceId,
    notifications: this.notifications,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);
