import api from "../axios.js";

export const getMyNotes = async (lectureId) => {
    const { data } = await api.get(`/note/${lectureId}`);
    return data;
};

export const createNote = async (lectureId, payload) => {
    const { data } = await api.post(`/note/${lectureId}`, payload);
    return data;
};

export const deleteNote = async (noteId) => {
    const { data } = await api.delete(`/note/${noteId}`);
    return data;
};
