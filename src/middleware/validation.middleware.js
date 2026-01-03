import { body, param, query, validationResult } from "express-validator";
import { AppError } from "../utils/appError.js";

// this is used when the validators are in the routes as pre function execution before the this middleware

// const validate = (req, res, next) => {
//   const errors = validationResult(req);

//   if (errors.isEmpty()) {
//     return next();
//   }
//   console.log(errors);
//   // and now we extract the errors fro the errors;

//   const extractedErrors = errors.array().map((err) => ({
//     field: err.path,
//     message: err.msg,
//   }));
//   throw new AppError("Validation failed", 400, extractedErrors);
// };

// this is used when we take the validator in same file not in the routes
export const validate = (validations) => {
  // this is function that return an middleware
  return async (req, res, next) => {
    // Run all validations and if any fails then is throw error
    await Promise.all(validations.map((validation) => validation.run(req))); // Runs all promises in parallel
    // Waits until all validations finish
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    // here we are extracting the error's from errors
    const extractedErrors = [];
    errors.errors.map((el) => {
      extractedErrors.push({
        field: el.path,
        value: el.value,
      });
    });
    throw new AppError(400, "Validation failed", extractedErrors);
  };
};

// Common validation chains
export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  objectId: (field) =>
    param(field).isMongoId().withMessage(`Invalid ${field} ID format`),

  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  password: body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character",
    ),

  name: body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Name can only contain letters and spaces"),

  price: body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  url: body("url").isURL().withMessage("Please provide a valid URL"),
};

// User validation chains
export const validateSignup = validate([
  commonValidations.name,
  commonValidations.email,
  commonValidations.password,
]);

export const validateSignin = validate([
  commonValidations.email,
  body("password").notEmpty().withMessage("Password is required"),
]);

export const validatePasswordChange = validate([
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character",
    ),
]);
