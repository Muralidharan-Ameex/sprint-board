import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    users: [],
    tasks: {},
    currentUserId: null,
    loaded: false
};

const sprintSlice = createSlice({
    name: "Sprint",
    initialState,
    reducers: {
        setInitialData(state, action){
            state.users = action.payload.users;
            state.tasks = action.payload.tasks;
            state.currentUserId = action.payload.currentUserId;
            state.loaded = true;
        },
        addUser(state, action){
            state.users.push(action.payload);
        },
        // addTask(state, action){
        //     state.tasks.new.push(action.payload);
        // },
        // setCurrentUser(state, action){
        //     state.currentUserId = action.payload;
        // }
    }
});

export const {
    setInitialData,
    addUser
} = sprintSlice.actions;

export default sprintSlice.reducer;