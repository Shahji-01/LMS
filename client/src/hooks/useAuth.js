import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
    loginUser,
    registerUser,
    logoutUser,
    fetchCurrentUser,
    clearError,
} from "../Store/Reducers/authSlice.jsx";

/**
 * useAuth — centralized auth state + actions
 */
const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error } = useSelector((s) => s.auth);

    const login = useCallback(
        (credentials) => dispatch(loginUser(credentials)).unwrap(),
        [dispatch]
    );

    const register = useCallback(
        (payload) => dispatch(registerUser(payload)).unwrap(),
        [dispatch]
    );

    const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

    const loadCurrentUser = useCallback(
        () => dispatch(fetchCurrentUser()),
        [dispatch]
    );

    const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        signIn: login,
        signUp: register,
        signOut: logout,
        loadCurrentUser,
        dismissError,
        isAdmin: user?.role === "admin",
        isInstructor: user?.role === "instructor" || user?.role === "admin",
    };
};

export default useAuth;
