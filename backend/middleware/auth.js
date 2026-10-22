import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'prompt_doctor_super_secret_lab_key_987654321_jwt'
      );

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied: User associated with this token not found.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid or expired laboratory token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication bearer token provided.',
    });
  }
};

// Optional auth: if token is present, populate req.user, else continue anonymously
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'prompt_doctor_super_secret_lab_key_987654321_jwt'
      );
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

export default { protect, optionalAuth };
