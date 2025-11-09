const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, specialty, npiNumber, organization, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate phone number format (if provided)
    let validatedPhone = phone;
    if (phone) {
      // Remove all non-digit characters except + at the start
      validatedPhone = phone.trim();
      // Check if it looks like an email (contains @)
      if (validatedPhone.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Phone number cannot be an email address. Please enter a valid phone number.'
        });
      }
      // Basic phone validation: should contain digits
      const phoneDigits = validatedPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number (at least 10 digits)'
        });
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'patient',
      phone: validatedPhone || undefined,
      specialty,
      npiNumber,
      organization,
      location
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    // Validate phone number if provided
    let validatedPhone = req.body.phone;
    if (validatedPhone !== undefined && validatedPhone !== null && validatedPhone !== '') {
      validatedPhone = validatedPhone.trim();
      // Check if it looks like an email (contains @)
      if (validatedPhone.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Phone number cannot be an email address. Please enter a valid phone number.'
        });
      }
      // Basic phone validation: should contain digits
      const phoneDigits = validatedPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number (at least 10 digits)'
        });
      }
    }

    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: validatedPhone || undefined,
      specialty: req.body.specialty,
      organization: req.body.organization,
      location: req.body.location,
      notifications: req.body.notifications,
      // Patient-specific fields
      dateOfBirth: req.body.dateOfBirth,
      insuranceProvider: req.body.insuranceProvider,
      insuranceId: req.body.insuranceId
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get users by role (for provider/admin)
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }

    // Only admin can see all users, providers can see patients and other providers
    if (req.user.role !== 'admin' && req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view users'
      });
    }

    // Providers can see patients and other providers (for referral creation)
    // Admin can see everyone
    const users = await User.find(query).select('firstName lastName email phone role specialty organization location');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

module.exports = router;
