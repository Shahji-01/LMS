// Custom error class
class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode; // HTTP code
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Marks as safe operational error
    this.errors = errors; // Array of detailed errors
    Error.captureStackTrace(this, this.constructor); // Stack trace
  }
}
export { AppError };
