import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios.js";

export const fetchCourseProgress = createAsyncThunk(
    "progress/fetchCourseProgress",
    async (courseId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/progress/${courseId}`);
            return { courseId, data: res.data.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

export const updateLectureProgress = createAsyncThunk(
    "progress/updateLecture",
    async ({ courseId, lectureId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/progress/${courseId}/lecture/${lectureId}`);
            return { courseId, data: res.data.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

const progressSlice = createSlice({
    name: "progress",
    initialState: {
        progressMap: {}, // { [courseId]: { completedLectures: [], progressPercentage } }
        loading: false,
        error: null,
    },
    reducers: {
        clearProgress: (state) => { state.progressMap = {}; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseProgress.pending, (state) => { state.loading = true; })
            .addCase(fetchCourseProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.progressMap[action.payload.courseId] = action.payload.data;
            })
            .addCase(fetchCourseProgress.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(updateLectureProgress.fulfilled, (state, action) => {
                state.progressMap[action.payload.courseId] = action.payload.data;
            });
    },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
