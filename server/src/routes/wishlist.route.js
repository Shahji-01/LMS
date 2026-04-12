import express from "express";
import { getMyWishlist, toggleWishlist, checkWishlistStatus } from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.route("/")
    .get(getMyWishlist);

router.route("/:courseId")
    .post(toggleWishlist);

router.route("/check/:courseId")
    .get(checkWishlistStatus);

export default router;
