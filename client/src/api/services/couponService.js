import api from "../axios.js";

export const getCoupons = async () => {
    const { data } = await api.get("/coupon");
    return data;
};

export const createCoupon = async (payload) => {
    const { data } = await api.post("/coupon", payload);
    return data;
};

export const toggleCouponStatus = async (id, isActive) => {
    const { data } = await api.patch(`/coupon/${id}/status`, { isActive });
    return data;
};

export const deleteCoupon = async (id) => {
    const { data } = await api.delete(`/coupon/${id}`);
    return data;
};

export const validateCoupon = async (code) => {
    const { data } = await api.post("/coupon/validate", { code });
    return data;
};
