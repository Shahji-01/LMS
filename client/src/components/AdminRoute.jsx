import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Route guard — only allows users with role = 'admin'
 */
const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useSelector((s) => s.auth);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3">Verifying Admin Access...</span>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
