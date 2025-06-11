// import { createSlice } from "@reduxjs/toolkit";
// import { signUp, signIn } from "./accountThunks";

// interface ThemeType {
//   backgroundColor: string;
//   textColor: string;
//   buttonColor: string;
//   buttonTextColor: string;
// }

// interface UserState {
//   user: {
//     userId: string;
//     userName: string;
//     userEmail: string;
//     authenticationType: string;
//     themes: ThemeType;
//   };
//   isSuccess: boolean;
//   isLoading: boolean;
//   isError: boolean;
//   errorMessage: string;
// }

// const initialState: UserState = {
//   user: {
//     userId: "",
//     userName: "",
//     userEmail: "",
//     authenticationType: "",
//     themes: {
//       backgroundColor: "",
//       textColor: "",
//       buttonColor: "",
//       buttonTextColor: ""
//     }
//   },
//   isSuccess: false,
//   isLoading: false,
//   isError: false,
//   errorMessage: ""
// };

// export const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     resetUser: (state) => {
//       Object.assign(state, initialState);
//     },
//     setUser: (state, action) => {
//       state.user = action.payload;
//     }
//   },

//   extraReducers: (builder) => {}
// });

// export const { resetUser, setUser } = userSlice.actions;
// export default userSlice.reducer;
