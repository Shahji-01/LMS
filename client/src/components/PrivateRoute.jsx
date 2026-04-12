import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until auth state is resolved before deciding to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  if (!user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default PrivateRoute;
