import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Diagnosis } from '../models/index.js';

// Token generator helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'prompt_doctor_super_secret_lab_key_987654321_jwt',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new laboratory practitioner
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A practitioner is already registered with this email.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Prompt Engineer',
      xp: 200,
      level: 1,
      streak: 1,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Practitioner registered successfully into Prompt Doctor Laboratory.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate practitioner & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or laboratory password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or laboratory password.',
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Laboratory authentication verified.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Protected
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Diagnosis,
          as: 'diagnoses',
          attributes: ['id', 'overallScore', 'status', 'createdAt'],
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    res.json({
      success: true,
      user,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout practitioner
// @route   POST /api/auth/logout
// @access  Public / Protected
export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Practitioner session concluded successfully.',
  });
};

export default {
  register,
  login,
  getMe,
  logout,
};
