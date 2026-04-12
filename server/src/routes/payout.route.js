import express from "express";
import { getInstructorRevenue, requestPayout } from "../controllers/payout.controller.js";
import { isAuthenticated, isInstructor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/revenue", isAuthenticated, isInstructor, getInstructorRevenue);
router.post("/request", isAuthenticated, isInstructor, requestPayout);

export default router;
