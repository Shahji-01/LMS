import api from "../axios.js";

export const getInstructorRevenue = async () => {
    const { data } = await api.get("/payout/revenue");
    return data;
};

export const requestPayout = async (payload) => {
    const { data } = await api.post("/payout/request", payload);
    return data;
};
