import { Coupon } from "../models/coupon.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Admin: Get all coupons
 * @route GET /api/v1/coupon
 */
export const getCoupons = catchAsync(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(new AppResponse(200, "Coupons retrieved", coupons));
});

/**
 * Admin: Create a new coupon
 * @route POST /api/v1/coupon
 */
export const createCoupon = catchAsync(async (req, res) => {
    const { code, discountPercentage, expirationDate, maxUses } = req.body;
    
    if (!code || !discountPercentage || !expirationDate) {
        throw new AppError(400, "Missing required fields.");
    }

    const uppercaseCode = code.toUpperCase();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) throw new AppError(400, "Coupon code already exists.");

    const coupon = await Coupon.create({
        code: uppercaseCode,
        discountPercentage,
        expirationDate,
        maxUses
    });

    return res.status(201).json(new AppResponse(201, "Coupon created.", coupon));
});

/**
 * Admin: Toggle coupon active status
 * @route PATCH /api/v1/coupon/:id/status
 */
export const toggleCouponStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!coupon) throw new AppError(404, "Coupon not found.");

    return res.status(200).json(new AppResponse(200, "Coupon status updated.", coupon));
});

/**
 * Admin: Delete coupon
 * @route DELETE /api/v1/coupon/:id
 */
export const deleteCoupon = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return res.status(200).json(new AppResponse(200, "Coupon deleted."));
});

/**
 * Public: Validate a coupon code before checkout
 * @route POST /api/v1/coupon/validate
 */
export const validateCoupon = catchAsync(async (req, res) => {
    const { code } = req.body;
    if (!code) throw new AppError(400, "Coupon code is required.");

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon || !coupon.isActive) {
        throw new AppError(400, "Invalid or inactive coupon code.");
    }

    if (new Date() > new Date(coupon.expirationDate)) {
        throw new AppError(400, "This coupon has expired.");
    }

    if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
        throw new AppError(400, "This coupon has reached its maximum usage limit.");
    }

    return res.status(200).json(new AppResponse(200, "Coupon is valid.", { 
        discountPercentage: coupon.discountPercentage,
        code: coupon.code
    }));
});
