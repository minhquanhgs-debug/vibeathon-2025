const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification } = require('../services/notificationService');

// @route   POST /api/referrals
// @desc    Create a new referral
// @access  Private (Provider only)
router.post('/', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const {
      patientId,
      receivingProviderId,
      specialty,
      reasonForReferral,
      clinicalNotes,
      urgency,
      patientInsurance
    } = req.body;

    // Validate required fields
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient is required'
      });
    }
    if (!receivingProviderId) {
      return res.status(400).json({
        success: false,
        message: 'Receiving provider is required'
      });
    }
    if (!specialty || !specialty.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Specialty is required'
      });
    }
    if (!reasonForReferral || !reasonForReferral.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reason for referral is required'
      });
    }

    // Verify patient and receiving provider exist
    const patient = await User.findById(patientId);
    const receivingProvider = await User.findById(receivingProviderId);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (!receivingProvider || receivingProvider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Receiving provider not found'
      });
    }

    // Calculate smart matching score
    const matchScore = calculateMatchScore(patient, receivingProvider, patientInsurance);

    // Create referral
    const referral = await Referral.create({
      patient: patientId,
      referringProvider: req.user.id,
      receivingProvider: receivingProviderId,
      specialty,
      reasonForReferral,
      clinicalNotes,
      urgency: urgency || 'routine',
      patientInsurance,
      matchScore: matchScore.score,
      matchingCriteria: matchScore.criteria
    });

    // Populate referral data
    await referral.populate(['patient', 'referringProvider', 'receivingProvider']);

    // Send notifications (non-blocking)
    sendNotification({
      type: 'email',
      to: receivingProvider.email,
      subject: 'New Referral Received',
      message: `You have received a new ${urgency} referral for ${patient.firstName} ${patient.lastName}.`
    }).catch(err => console.error('Notification error:', err));

    sendNotification({
      type: 'email',
      to: patient.email,
      subject: 'Referral Created',
      message: `Your referral to ${receivingProvider.firstName} ${receivingProvider.lastName} has been created.`
    }).catch(err => console.error('Notification error:', err));

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: referral
    });
  } catch (error) {
    console.error('Create referral error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error creating referral';
    
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    } else if (error.code === 11000) {
      errorMessage = 'Referral number already exists. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/referrals
// @desc    Get all referrals (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, urgency, specialty, startDate, endDate } = req.query;
    
    let query = {};

    // Filter based on user role
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'provider') {
      query.$or = [
        { referringProvider: req.user.id },
        { receivingProvider: req.user.id }
      ];
    }
    // Admin can see all referrals

    // Apply additional filters
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (specialty) query.specialty = specialty;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const referrals = await Referral.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('referringProvider', 'firstName lastName specialty organization')
      .populate('receivingProvider', 'firstName lastName specialty organization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referrals',
      error: error.message
    });
  }
});

// @route   GET /api/referrals/:id
// @desc    Get single referral by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // First check if referral exists and verify authorization (before populating for efficiency)
    const referralExists = await Referral.findById(req.params.id).select('patient referringProvider receivingProvider');
    
    if (!referralExists) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check authorization using ObjectIds (before population)
    const userId = req.user.id.toString();
    const isAuthorized = 
      req.user.role === 'admin' ||
      referralExists.patient.toString() === userId ||
      referralExists.referringProvider.toString() === userId ||
      referralExists.receivingProvider.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this referral'
      });
    }

    // Now populate and return the full referral data
    const referral = await Referral.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone dateOfBirth insuranceProvider')
      .populate('referringProvider', 'firstName lastName specialty organization location')
      .populate('receivingProvider', 'firstName lastName specialty organization location')
      .populate('timeline.updatedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (error) {
    console.error('Get referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral',
      error: error.message
    });
  }
});

// @route   PUT /api/referrals/:id/status
// @desc    Update referral status
// @access  Private (Provider only)
router.put('/:id/status', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const { status, note, appointmentDate, appointmentLocation } = req.body;

    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Update status using model method
    referral.updateStatus(status, note, req.user.id);

    // Update appointment details if provided
    if (appointmentDate) referral.appointmentDate = appointmentDate;
    if (appointmentLocation) referral.appointmentLocation = appointmentLocation;

    await referral.save();
    await referral.populate(['patient', 'referringProvider', 'receivingProvider']);

    // Send notification to patient (non-blocking)
    sendNotification({
      type: 'email',
      to: referral.patient.email,
      subject: 'Referral Status Update',
      message: `Your referral status has been updated to: ${status}`
    }).catch(err => console.error('Notification error:', err));

    res.status(200).json({
      success: true,
      message: 'Referral status updated successfully',
      data: referral
    });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating referral status',
      error: error.message
    });
  }
});

// @route   GET /api/referrals/analytics/overview
// @desc    Get referral analytics overview
// @access  Private (Admin and Provider)
router.get('/analytics/overview', protect, authorize('admin', 'provider'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Filter by provider if not admin
    let providerFilter = {};
    if (req.user.role === 'provider') {
      providerFilter.$or = [
        { referringProvider: req.user.id },
        { receivingProvider: req.user.id }
      ];
    }

    const query = { ...dateFilter, ...providerFilter };

    // Total referrals
    const totalReferrals = await Referral.countDocuments(query);

    // Status breakdown
    const statusBreakdown = await Referral.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average response times
    const avgTimes = await Referral.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgTimeToAcknowledge: { $avg: '$timeToAcknowledge' },
          avgTimeToSchedule: { $avg: '$timeToSchedule' },
          avgTimeToComplete: { $avg: '$timeToComplete' }
        }
      }
    ]);

    // Urgency breakdown
    const urgencyBreakdown = await Referral.aggregate([
      { $match: query },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        statusBreakdown,
        urgencyBreakdown,
        averageTimes: avgTimes[0] || {}
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Helper function to calculate smart matching score
function calculateMatchScore(patient, provider, insurance) {
  let score = 0;
  const criteria = {
    insuranceMatch: false,
    locationDistance: null,
    availabilityMatch: false,
    specialtyMatch: true
  };

  // Insurance match (30 points)
  if (insurance && insurance.provider) {
    criteria.insuranceMatch = true;
    score += 30;
  }

  // Location proximity (30 points)
  if (patient.location && provider.location) {
    // Simplified location matching - in production, use actual distance calculation
    if (patient.location.city === provider.location.city) {
      score += 30;
      criteria.locationDistance = 0;
    } else if (patient.location.state === provider.location.state) {
      score += 15;
      criteria.locationDistance = 50;
    }
  }

  // Specialty match (20 points) - assuming already matched
  score += 20;

  // Availability (20 points) - can be enhanced with real availability data
  criteria.availabilityMatch = true;
  score += 20;

  return { score, criteria };
}

module.exports = router;
