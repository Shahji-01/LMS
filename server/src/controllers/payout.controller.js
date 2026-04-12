import { Payout } from "../models/payout.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";
import mongoose from "mongoose";

const PLATFORM_FEE_PERCENTAGE = 30;

/**
 * Instructor: Get revenue summary and payout history
 * @route GET /api/v1/payout/revenue
 */
export const getInstructorRevenue = catchAsync(async (req, res) => {
    const instructorId = req.user._id;

    // 1. Calculate Gross Revenue
    const revenueResult = await CoursePurchase.aggregate([
        {
            $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "courseObj"
            }
        },
        { $unwind: "$courseObj" },
        { 
            $match: { 
                "courseObj.instructor": new mongoose.Types.ObjectId(instructorId), 
                status: "completed" 
            } 
        },
        { $group: { _id: null, totalGross: { $sum: "$amount" } } }
    ]);

    const totalGross = revenueResult.length > 0 ? revenueResult[0].totalGross : 0;
    
    // 2. Calculate Net Revenue
    const totalNet = totalGross * ((100 - PLATFORM_FEE_PERCENTAGE) / 100);

    // 3. Calculate Withdrawals (pending + paid)
    const payoutsResult = await Payout.aggregate([
        { 
            $match: { 
                instructor: new mongoose.Types.ObjectId(instructorId),
                status: { $in: ["pending", "paid"] }
            } 
        },
        { $group: { _id: null, totalWithdrawn: { $sum: "$amount" } } }
    ]);

    const totalWithdrawn = payoutsResult.length > 0 ? payoutsResult[0].totalWithdrawn : 0;
    
    // 4. Calculate Available Balance
    const availableBalance = Math.max(0, totalNet - totalWithdrawn);

    // 5. Get Payout History
    const history = await Payout.find({ instructor: instructorId }).sort({ createdAt: -1 });

    return res.status(200).json(new AppResponse(200, "Revenue data fetched.", {
        grossRevenue: totalGross,
        netRevenue: totalNet,
        platformFeePct: PLATFORM_FEE_PERCENTAGE,
        totalWithdrawn,
        availableBalance,
        history
    }));
});

/**
 * Instructor: Request a payout
 * @route POST /api/v1/payout/request
 */
export const requestPayout = catchAsync(async (req, res) => {
    const instructorId = req.user._id;
    const { amount, paymentEmail } = req.body;

    if (!amount || amount < 100) {
        throw new AppError(400, "Minimum payout amount is ₹100.");
    }
    if (!paymentEmail) {
        throw new AppError(400, "Payment email is required (e.g. PayPal/UPI).");
    }

    // Double check available balance before allowing request
    const revenueResult = await CoursePurchase.aggregate([
        { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "c" } },
        { $unwind: "$c" },
        { $match: { "c.instructor": new mongoose.Types.ObjectId(instructorId), status: "completed" } },
        { $group: { _id: null, totalGross: { $sum: "$amount" } } }
    ]);
    const gross = revenueResult.length > 0 ? revenueResult[0].totalGross : 0;
    const net = gross * ((100 - PLATFORM_FEE_PERCENTAGE) / 100);

    const withdrawals = await Payout.aggregate([
        { $match: { instructor: new mongoose.Types.ObjectId(instructorId), status: { $in: ["pending", "paid"] } } },
        { $group: { _id: null, w: { $sum: "$amount" } } }
    ]);
    const withdrawnSum = withdrawals.length > 0 ? withdrawals[0].w : 0;
    
    const available = net - withdrawnSum;

    if (amount > available) {
        throw new AppError(400, "Requested amount exceeds available balance.");
    }

    // Create payout
    const payout = await Payout.create({
        instructor: instructorId,
        amount,
        paymentEmail,
        status: "pending"
    });

    return res.status(201).json(new AppResponse(201, "Payout request submitted.", payout));
});
