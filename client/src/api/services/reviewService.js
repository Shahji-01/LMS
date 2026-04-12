import api from "../axios";

export const getCourseReviews = async (courseId) => {
    const response = await api.get(`/review/${courseId}`);
    return response.data;
};

export const upsertReview = async (courseId, reviewData) => {
    const response = await api.post(`/review/${courseId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/review/${reviewId}`);
    return response.data;
};
