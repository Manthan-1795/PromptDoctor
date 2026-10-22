export const errorHandler = (err, req, res, next) => {
  console.error('⚠️ [PROMPT DOCTOR ERROR]:', err.stack || err.message);

  let statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Laboratory Server Error';

  // Sequelize validation error handler
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors ? err.errors.map((e) => e.message).join(', ') : 'Database validation failed.';
  }

  // Scrub any sensitive credentials from the error message
  message = message.replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
  message = message.replace(/(password|jwt|secret)=[^&\s]+/gi, '$1=[REDACTED]');

  res.status(statusCode).json({
    success: false,
    error: err.code || 'Laboratory Error',
    message,
    // Never expose stack traces or raw keys to the client
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Resource endpoint not found: ${req.originalUrl}`,
  });
};

export default { errorHandler, notFound };
