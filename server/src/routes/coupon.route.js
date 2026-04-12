import express from "express";
import { getCoupons, createCoupon, toggleCouponStatus, deleteCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/validate", isAuthenticated, validateCoupon);

// Admin Only
router.get("/", isAuthenticated, isAdmin, getCoupons);
router.post("/", isAuthenticated, isAdmin, createCoupon);
router.patch("/:id/status", isAuthenticated, isAdmin, toggleCouponStatus);
router.delete("/:id", isAuthenticated, isAdmin, deleteCoupon);

export default router;
