import { configureStore } from "@reduxjs/toolkit";
import sprintReducer from './sprintSlice';

export const store = configureStore({
    reducer: {
        sprint: sprintReducer
    }
})