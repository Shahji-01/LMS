import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { checkoutLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// FIX: Apply checkoutLimiter to protect payment endpoints from abuse
router.post("/create-order", checkoutLimiter, isAuthenticated, createRazorpayOrder);
router.post("/verify-payment", checkoutLimiter, isAuthenticated, verifyPayment);

export default router;
