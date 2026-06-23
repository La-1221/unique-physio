// Converts thrown errors (including Mongoose validation errors) into
// consistent JSON responses the frontend can render as field-level errors.

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let fieldErrors = {};

  // Mongoose validation errors -> per-field messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    Object.keys(err.errors).forEach((key) => {
      fieldErrors[key] = err.errors[key].message;
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    fieldErrors[field] = `This ${field} is already registered.`;
    message = 'Duplicate field value';
  }

  // Invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
