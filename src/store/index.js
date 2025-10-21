// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import { setStore } from "../utils/axiosConfig"; // Import the setter function

// Combine all reducers
const rootReducer = combineReducers({
    globalState: authSlice,
    // Add other slices here as needed
});

// Persist configuration
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["globalState"], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

const persistor = persistStore(store);

// Call setStore to inject the store instance into axiosConfig AFTER it's created
setStore(store); // <--- ADD THIS LINE

export { store, persistor };