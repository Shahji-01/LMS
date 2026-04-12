import api from "../axios.js";

/** GET /api/v1/analytics/instructor — instructor analytics summary */
export const getInstructorAnalytics = async () => {
    const { data } = await api.get("/analytics/instructor");
    return data;
};

/** GET /api/v1/analytics/instructor/course/:courseId — daily analytics for one course */
export const getCourseAnalytics = async (courseId) => {
    const { data } = await api.get(`/analytics/instructor/course/${courseId}`);
    return data;
};

/** GET /api/v1/analytics/admin — platform-wide analytics (admin only) */
export const getAdminAnalytics = async () => {
    const { data } = await api.get("/analytics/admin");
    return data;
};
