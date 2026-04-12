import api from "../axios.js";

/** POST /api/v1/purchase/checkout/create-checkout-session */
export const initiateStripeCheckout = async (courseId) => {
    const { data } = await api.post("/purchase/checkout/create-checkout-session", {
        courseId,
    });
    return data; // data.data.checkoutUrl
};

/** POST /api/v1/razorpay/create-order */
export const createRazorpayOrder = async (courseId) => {
    const { data } = await api.post("/razorpay/create-order", { courseId });
    return data;
};

/** POST /api/v1/razorpay/verify-payment */
export const verifyRazorpayPayment = async (payload) => {
    const { data } = await api.post("/razorpay/verify-payment", payload);
    return data;
};

/** GET /api/v1/purchase (all purchased courses for the user) */
export const getPurchasedCourses = async () => {
    const { data } = await api.get("/purchase");
    return data;
};

/** GET /api/v1/purchase/course/:courseId/detail-with-status */
export const getPurchaseStatus = async (courseId) => {
    const { data } = await api.get(`/purchase/course/${courseId}/detail-with-status`);
    return data;
};
