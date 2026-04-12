import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios.js";

export const initiateStripeCheckout = createAsyncThunk(
    "payment/stripeCheckout",
    async (courseId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/purchase/checkout/stripe", { courseId });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

export const initiateRazorpayCheckout = createAsyncThunk(
    "payment/razorpayCheckout",
    async (courseId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/razorpay/order", { courseId });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

export const fetchPurchaseStatus = createAsyncThunk(
    "payment/fetchStatus",
    async (courseId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/purchase/status/${courseId}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error?.message || err.message);
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        checkoutUrl: null,
        razorpayOrder: null,
        purchaseStatus: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearPayment: (state) => {
            state.checkoutUrl = null;
            state.razorpayOrder = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Stripe
            .addCase(initiateStripeCheckout.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(initiateStripeCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutUrl = action.payload?.checkoutUrl;
            })
            .addCase(initiateStripeCheckout.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Razorpay
            .addCase(initiateRazorpayCheckout.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(initiateRazorpayCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.razorpayOrder = action.payload;
            })
            .addCase(initiateRazorpayCheckout.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Status
            .addCase(fetchPurchaseStatus.fulfilled, (state, action) => {
                state.purchaseStatus = action.payload;
            });
    },
});

export const { clearPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
