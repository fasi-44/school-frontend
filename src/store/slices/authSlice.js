// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customAxios from "../../utils/axiosConfig"; // Update with your axios instance path
import { toast } from "react-toastify";

// Async thunk for login
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await customAxios.post("/auth/login", loginData);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Login failed";
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    "auth/logoutUser", // Name of the thunk
    async (_, { rejectWithValue }) => {
        try {
            // customAxios will automatically attach the JWT from Redux state (via interceptor)
            const response = await customAxios.post('/auth/logout');
            toast.success(response.data.message);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Failed to log out.";
            console.error("Logout API error:", error); // Log the full error for debugging
            return rejectWithValue(errorMessage);
        }
    }
);

const initialState = {
    loggedUser: null,
    authToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Reset auth state
        resetAuth: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.loggedUser = action.payload.user;
                state.authToken = action.payload.access_token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Logout cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, () => initialState)
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, updateLocation, resetAuth } = authSlice.actions;
export default authSlice.reducer;
