import api from "../axios.js";

/** GET /api/v1/user/profile */
export const getProfile = async () => {
    const { data } = await api.get("/user/profile");
    return data;
};

/** PATCH /api/v1/user/profile (multipart for avatar) */
export const updateProfile = async (formData) => {
    const { data } = await api.patch("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

/** PATCH /api/v1/user/change-password */
export const changePassword = async ({ currentPassword, newPassword }) => {
    const { data } = await api.patch("/user/change-password", {
        currentPassword,
        newPassword,
    });
    return data;
};

/** DELETE /api/v1/user/account */
export const deleteAccount = async () => {
    const { data } = await api.delete("/user/account");
    return data;
};
