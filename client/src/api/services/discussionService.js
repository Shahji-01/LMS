import api from "../axios.js";

export const getDiscussions = async (lectureId) => {
    const { data } = await api.get(`/discussion/${lectureId}`);
    return data;
};

export const createDiscussion = async (courseId, lectureId, payload) => {
    const { data } = await api.post(`/discussion/${courseId}/${lectureId}`, payload);
    return data;
};

export const deleteDiscussion = async (discussionId) => {
    const { data } = await api.delete(`/discussion/${discussionId}`);
    return data;
};
