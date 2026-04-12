import api from "../axios.js";

export const getCourseQuizzes = async (courseId) => {
    const { data } = await api.get(`/quiz/course/${courseId}`);
    return data;
};

export const createQuiz = async (courseId, payload) => {
    const { data } = await api.post(`/quiz/course/${courseId}`, payload);
    return data;
};

export const submitQuiz = async (quizId, answers) => {
    const { data } = await api.post(`/quiz/${quizId}/submit`, { answers });
    return data;
};

export const deleteQuiz = async (quizId) => {
    const { data } = await api.delete(`/quiz/${quizId}`);
    return data;
};
