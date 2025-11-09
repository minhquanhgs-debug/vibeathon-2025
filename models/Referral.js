const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralNumber: {
    type: String,
    unique: true,
    required: false // Generated in pre-save hook
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  referringProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referring provider is required']
  },
  receivingProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiving provider is required']
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  reasonForReferral: {
    type: String,
    required: [true, 'Reason for referral is required'],
    trim: true
  },
  clinicalNotes: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: [
      'pending',
      'acknowledged',
      'scheduled',
      'completed',
      'cancelled',
      'rejected'
    ],
    default: 'pending'
  },
  appointmentDate: {
    type: Date
  },
  appointmentLocation: {
    type: String,
    trim: true
  },
  // Tracking and workflow
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Smart matching data
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchingCriteria: {
    insuranceMatch: Boolean,
    locationDistance: Number,
    availabilityMatch: Boolean,
    specialtyMatch: Boolean
  },
  // Analytics
  timeToAcknowledge: {
    type: Number // in hours
  },
  timeToSchedule: {
    type: Number // in hours
  },
  timeToComplete: {
    type: Number // in hours
  },
  // Notifications sent
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms']
    },
    recipient: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    purpose: {
      type: String
    }
  }],
  // Additional metadata
  patientInsurance: {
    provider: String,
    memberId: String
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  // AI-powered insights
  aiInsights: {
    leakageRisk: {
      type: Number,
      min: 0,
      max: 1
    },
    noshowProbability: {
      type: Number,
      min: 0,
      max: 1
    },
    overallRisk: {
      type: Number,
      min: 0,
      max: 1
    },
    recommendations: [{
      type: String
    }],
    optimalScheduling: {
      daysOut: Number,
      dayOfWeek: String,
      timeSlot: String
    },
    parsedClinicalData: {
      specialty: String,
      urgency: String,
      diagnoses: [String],
      medications: [String],
      procedures: [String]
    },
    lastUpdated: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Generate unique referral number before saving
referralSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Count referrals this month
    const count = await mongoose.model('Referral').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.referralNumber = `REF-${year}${month}-${String(count + 1).padStart(5, '0')}`;
    
    // Initialize timeline if it doesn't exist
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [];
    }
    
    this.timeline.push({
      status: 'pending',
      timestamp: new Date(),
      note: 'Referral created'
    });
    
    next();
  } catch (error) {
    console.error('Error generating referral number:', error);
    next(error);
  }
});

// Method to update status
referralSchema.methods.updateStatus = function(newStatus, note, userId) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: userId
  });
  
  // Calculate timing metrics
  const createdTime = this.createdAt.getTime();
  const now = Date.now();
  
  if (newStatus === 'acknowledged' && !this.timeToAcknowledge) {
    this.timeToAcknowledge = (now - createdTime) / (1000 * 60 * 60); // hours
  }
  
  if (newStatus === 'scheduled' && !this.timeToSchedule) {
    this.timeToSchedule = (now - createdTime) / (1000 * 60 * 60);
  }
  
  if (newStatus === 'completed' && !this.timeToComplete) {
    this.timeToComplete = (now - createdTime) / (1000 * 60 * 60);
  }
};

// Index for faster queries
referralSchema.index({ patient: 1, status: 1 });
referralSchema.index({ referringProvider: 1, status: 1 });
referralSchema.index({ receivingProvider: 1, status: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ referralNumber: 1 });

module.exports = mongoose.model('Referral', referralSchema);
