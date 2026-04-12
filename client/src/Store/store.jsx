import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Reducers/authSlice.jsx";
import courseReducer from "./Reducers/courseSlice.jsx";
import progressReducer from "./Reducers/progressSlice.jsx";
import paymentReducer from "./Reducers/paymentSlice.jsx";

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    progress: progressReducer,
    payment: paymentReducer,
  },
});

export default store;
