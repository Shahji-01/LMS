import logger from "../utils/logger.js";
import { AppError } from "../utils/appError.js";

// Error handler for async functions
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        // Development error response
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
            ...(err.data && { data: err.data }),
            ...(err.errors && err.errors.length > 0 && { errors: err.errors })
        });
    } else {
        // Production error response
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                ...(err.data && { data: err.data }),
                ...(err.errors && err.errors.length > 0 && { errors: err.errors })
            });
        } else {
            // Programming or other unknown error: don't leak error details
            logger.error({ err }, 'ERROR 💥');
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// Handle specific MongoDB errors
export const handleMongoError = (err) => {
    if (err.name === 'CastError') {
        return new AppError(400, `Invalid ${err.path}: ${err.value}`);
    }
    if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        return new AppError(400, `Duplicate field value: ${value}. Please use another value!`);
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return new AppError(400, `Invalid input data. ${errors.join('. ')}`);
    }
    return err;
};

// Handle JWT errors
export const handleJWTError = () =>
    new AppError(401, 'Invalid token. Please log in again!');

export const handleJWTExpiredError = () =>
    new AppError(401, 'Your token has expired! Please log in again.');
