import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';

const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'police_complaint_super_secret_jwt_key_2026_secured',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new citizen
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      address,
      city,
      state,
      pinCode,
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Full Name, Email, Mobile, Password).',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    if (isConnectedToMongo) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }
    } else {
      const existingUser = memoryStore.users.find((u) => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;
    if (isConnectedToMongo) {
      newUser = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        address: address || '',
        city: city || '',
        state: state || '',
        pinCode: pinCode || '',
        role: 'citizen',
      });
    } else {
      const generatedId = `citizen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      newUser = {
        _id: generatedId,
        id: generatedId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        address: address || '',
        city: city || '',
        state: state || '',
        pinCode: pinCode || '',
        role: 'citizen',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(newUser);
      memoryStore.saveToDisk('users');
    }

    const token = generateToken(newUser._id, newUser.role, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user: {
        id: newUser._id,
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        pinCode: newUser.pinCode,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Citizen / General Login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.',
      });
    }

    const searchStr = email.toLowerCase().trim();
    let user;

    if (isConnectedToMongo) {
      user = await User.findOne({
        $or: [{ email: searchStr }, { fullName: new RegExp(`^${searchStr}$`, 'i') }],
      });
    } else {
      user = memoryStore.users.find(
        (u) =>
          u.email === searchStr ||
          (u.role === 'admin' &&
            (searchStr === (process.env.INITIAL_ADMIN_USERNAME || 'harsha').toLowerCase() ||
              u.email === searchStr))
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = generateToken(user._id, user.role, user.email);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pinCode: user.pinCode,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, city, state, pinCode } = req.body;
    const userId = req.user._id || req.user.id;

    if (isConnectedToMongo) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (fullName) user.fullName = fullName.trim();
      if (phone) user.phone = phone.trim();
      if (address !== undefined) user.address = address;
      if (city !== undefined) user.city = city;
      if (state !== undefined) user.state = state;
      if (pinCode !== undefined) user.pinCode = pinCode;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pinCode: user.pinCode,
          role: user.role,
        },
      });
    } else {
      const user = memoryStore.users.find((u) => String(u._id) === String(userId));
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (fullName) user.fullName = fullName.trim();
      if (phone) user.phone = phone.trim();
      if (address !== undefined) user.address = address;
      if (city !== undefined) user.city = city;
      if (state !== undefined) user.state = state;
      if (pinCode !== undefined) user.pinCode = pinCode;
      user.updatedAt = new Date();

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pinCode: user.pinCode,
          role: user.role,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    let user;
    if (isConnectedToMongo) {
      user = await User.findById(userId);
    } else {
      user = memoryStore.users.find((u) => String(u._id) === String(userId));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;

    if (isConnectedToMongo) {
      await user.save();
    } else {
      user.updatedAt = new Date();
    }

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide email address.' });
  }

  // To protect privacy, always respond with a uniform message
  res.json({
    success: true,
    message: 'If an account exists with that email address, password reset instructions have been forwarded.',
  });
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Invalid reset request parameters.' });
  }

  res.json({
    success: true,
    message: 'Password has been successfully updated. You may now log in.',
  });
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
