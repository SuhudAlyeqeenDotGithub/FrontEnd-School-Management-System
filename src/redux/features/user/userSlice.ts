import { createSlice } from "@reduxjs/toolkit";
import { signUp, signIn } from "./userThunk";

interface ThemeType {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

interface UserState {
  user: {
    userId: string;
    userName: string;
    userEmail: string;
    authenticationType: string;
    themes: ThemeType;
  };
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: UserState = {
  user: {
    userId: "",
    userName: "",
    userEmail: "",
    authenticationType: "",
    themes: {
      backgroundColor: "",
      textColor: "",
      buttonColor: "",
      buttonTextColor: ""
    }
  },
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUser: (state) => {
      Object.assign(state, initialState);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetUser, setUser } = userSlice.actions;
export default userSlice.reducer;
