import api from "../axios.js";

/** POST /api/v1/user/signup */
export const signup = async ({ name, email, password, role }) => {
    const { data } = await api.post("/user/signup", { name, email, password, role });
    return data;
};

/** POST /api/v1/user/signin */
export const signin = async ({ email, password }) => {
    const { data } = await api.post("/user/signin", { email, password });
    return data;
};

/** POST /api/v1/user/signout */
export const signout = async () => {
    const { data } = await api.post("/user/signout");
    return data;
};

/** POST /api/v1/user/forgot-password */
export const forgotPassword = async (email) => {
    const { data } = await api.post("/user/forgot-password", { email });
    return data;
};

/** POST /api/v1/user/reset-password/:token */
export const resetPassword = async (token, newPassword) => {
    const { data } = await api.post(`/user/reset-password/${token}`, { newPassword });
    return data;
};
