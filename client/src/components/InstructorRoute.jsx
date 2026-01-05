import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InstructorRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "instructor" ? children : <Navigate to="/dashboard" replace />;
};

export default InstructorRoute;
