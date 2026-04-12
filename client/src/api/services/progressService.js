import api from "../axios.js";

/** GET /api/v1/progress/:courseId */
export const getCourseProgress = async (courseId) => {
    const { data } = await api.get(`/progress/${courseId}`);
    return data;
};

/** PATCH /api/v1/progress/:courseId/lectures/:lectureId */
export const updateLectureProgress = async (courseId, lectureId, completed) => {
    const { data } = await api.patch(
        `/progress/${courseId}/lectures/${lectureId}`,
        { completed }
    );
    return data;
};

/** PATCH /api/v1/progress/:courseId/complete */
export const markCourseComplete = async (courseId) => {
    const { data } = await api.patch(`/progress/${courseId}/complete`);
    return data;
};

/** PATCH /api/v1/progress/:courseId/reset */
export const resetCourseProgress = async (courseId) => {
    const { data } = await api.patch(`/progress/${courseId}/reset`);
    return data;
};
