import api from "../axios.js";

/** GET /api/v1/course/published?page=&limit= */
export const getPublishedCourses = async (page = 1, limit = 12) => {
    const { data } = await api.get("/course/published", { params: { page, limit } });
    return data;
};

/** GET /api/v1/course/search?query=&level=&categories=&sortBy= */
export const searchCourses = async (params = {}) => {
    const { data } = await api.get("/course/search", { params });
    return data;
};

/** GET /api/v1/course/c/:courseId */
export const getCourseById = async (courseId) => {
    const { data } = await api.get(`/course/c/${courseId}`);
    return data;
};

/** GET /api/v1/course (instructor's created courses) */
export const getMyCreatedCourses = async () => {
    const { data } = await api.get("/course");
    return data;
};

/** POST /api/v1/course (multipart for thumbnail) */
export const createCourse = async (formData) => {
    const { data } = await api.post("/course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

/** PATCH /api/v1/course/c/:courseId (multipart for thumbnail) */
export const updateCourse = async (courseId, formData) => {
    const { data } = await api.patch(`/course/c/${courseId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

/** GET /api/v1/course/c/:courseId/lectures */
export const getCourseLectures = async (courseId) => {
    const { data } = await api.get(`/course/c/${courseId}/lectures`);
    return data;
};

/** POST /api/v1/course/c/:courseId/lectures (multipart for video) */
export const addLecture = async (courseId, formData) => {
    const { data } = await api.post(`/course/c/${courseId}/lectures`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};
