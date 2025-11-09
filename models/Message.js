const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: [true, 'Referral is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'status_update'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ referral: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
