// Custom error class
class AppError extends Error {
  constructor(statusCode, message, data, errors = []) {
    super(message);
    this.statusCode = statusCode; // HTTP code
    this.data = data;
    this.status = `${statusCode}`.startsWith("4")
      ? "fail"
      : "error" || `${statusCode}`.startsWith("2")
        ? "success"
        : "";
    this.isOperational = true; // Marks as safe operational error
    this.errors = errors; // Array of detailed errors
    Error.captureStackTrace(this, this.constructor); // Stack trace
  }
}
export { AppError };
