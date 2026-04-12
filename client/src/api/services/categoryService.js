import api from "../axios.js";

export const getCategories = async () => {
    const { data } = await api.get("/category");
    return data;
};

export const createCategory = async (payload) => {
    const { data } = await api.post("/category", payload);
    return data;
};

export const updateCategory = async (id, payload) => {
    const { data } = await api.put(`/category/${id}`, payload);
    return data;
};

export const deleteCategory = async (id) => {
    const { data } = await api.delete(`/category/${id}`);
    return data;
};
