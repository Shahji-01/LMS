import api from "../axios";

export const getMyWishlist = async () => {
    const response = await api.get("/wishlist");
    return response.data;
};

export const toggleWishlist = async (courseId) => {
    const response = await api.post(`/wishlist/${courseId}`);
    return response.data;
};

export const checkWishlistStatus = async (courseId) => {
    const response = await api.get(`/wishlist/check/${courseId}`);
    return response.data;
};
