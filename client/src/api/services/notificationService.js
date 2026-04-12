import api from "../axios.js";

export const getMyNotifications = async () => {
    const { data } = await api.get("/notification");
    return data;
};

export const markAsRead = async (id) => {
    const { data } = await api.patch(`/notification/${id}/read`);
    return data;
};

export const markAllAsRead = async () => {
    const { data } = await api.patch("/notification/read-all");
    return data;
};
