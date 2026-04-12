import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until auth state is resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  if (user.role !== "instructor" && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default InstructorRoute;
