import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios.js";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPublishedCourses = createAsyncThunk(
    "course/fetchPublished",
    async (params, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/course/published", { params });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

export const fetchCourseDetails = createAsyncThunk(
    "course/fetchDetails",
    async (courseId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/course/c/${courseId}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

export const searchCourses = createAsyncThunk(
    "course/search",
    async (query, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/course/search", { params: query });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const courseSlice = createSlice({
    name: "course",
    initialState: {
        courses: [],
        currentCourse: null,
        searchResults: [],
        pagination: null,
        filters: { query: "", category: "", level: "", sortBy: "newest" },
        loading: false,
        error: null,
    },
    reducers: {
        setFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = { query: "", category: "", level: "", sortBy: "newest" };
        },
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Published Courses
            .addCase(fetchPublishedCourses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPublishedCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchPublishedCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Course Details
            .addCase(fetchCourseDetails.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCourseDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCourse = action.payload?.course || action.payload;
            })
            .addCase(fetchCourseDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Search
            .addCase(searchCourses.pending, (state) => { state.loading = true; })
            .addCase(searchCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload.data || [];
            })
            .addCase(searchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { setFilter, clearFilters, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
