const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  emailLogin,
  googleAuth,
  updatePan 
} = require('../controllers/auth.controller.js');
const { auth } = require('../middleware/auth.js');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST api/auth/email-login
// @desc    Initiate email-only login (magic link)
// @access  Public
router.post('/email-login', emailLogin);

// @route   POST api/auth/google
// @desc    Google OAuth login/signup
// @access  Public
router.post('/google', googleAuth);

// @route   PUT api/auth/update-pan
// @desc    Update PAN for Google signed-up users
// @access  Private
router.put('/update-pan', auth, updatePan);

module.exports = router;