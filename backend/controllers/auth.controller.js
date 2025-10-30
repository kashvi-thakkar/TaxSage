const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
=======
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893

// Generate a secure token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { firstName, lastName, pan, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if PAN already exists
        const panExists = await User.findOne({ pan });
        if (panExists) {
            return res.status(400).json({ message: 'PAN number already registered' });
        }

        // Create new user - password will be automatically hashed by the pre-save hook
        const user = await User.create({
            firstName,
            lastName,
            pan: pan.toUpperCase(),
            email: email.toLowerCase(),
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                pan: user.pan,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern.email) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            if (error.keyPattern.pan) {
                return res.status(400).json({ message: 'PAN number already registered' });
            }
        }
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user by email (case insensitive)
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                pan: user.pan,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Initiate email-only login (magic link)
// @route   POST /api/auth/email-login
const emailLogin = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // For now, we'll simulate sending a magic link
        // In production, you would:
        // 1. Generate a secure token for magic link
        // 2. Send email with the magic link
        // 3. Create another endpoint to verify the magic link token
        
        console.log(`Magic link login requested for: ${email}`);
        
        res.json({ 
            success: true, 
            message: 'If an account exists with this email, you will receive login instructions shortly.' 
        });
        
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

<<<<<<< HEAD
// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user with Google data
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      // Generate a random PAN (users can update later)
      const randomPan = 'GOOGL' + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        pan: randomPan,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        password: await bcrypt.hash(Math.random().toString(36) + googleId, 10) // Random password
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pan: user.pan,
      avatar: user.avatar,
      token: token,
      isNewUser: !user.pan || user.pan.startsWith('GOOGL')
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

// @desc    Update PAN for Google signed-up users
// @route   PUT /api/auth/update-pan
const updatePan = async (req, res) => {
  try {
    const { pan } = req.body;
    const userId = req.userId;

    // Check if PAN is already taken
    const existingUser = await User.findOne({ 
      pan: pan.toUpperCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'PAN number already registered' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        pan: pan.toUpperCase(),
        $unset: { tempPan: 1 } // Remove temporary PAN if exists
      },
      { new: true }
    );

    res.json({
      message: 'PAN updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        pan: user.pan
      }
    });

  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// Make sure you're exporting the functions correctly
module.exports = { 
  registerUser, 
  loginUser, 
  emailLogin,
  googleAuth,
  updatePan
};
=======
module.exports = { registerUser, loginUser, emailLogin };
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893
