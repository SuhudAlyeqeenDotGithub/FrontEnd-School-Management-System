import { createSlice } from "@reduxjs/toolkit";
import { orgSignUp, orgSignIn } from "./accountThunks";
import { OrgType } from "@/interfaces/interfaces";

interface OrgState {
  orgData: OrgType;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: OrgState = {
  orgData: {
    _id: "",
    organisationName: "",
    organisationPhone: "",
    organisationPassword: "",
    organisationImage: "",
    themes: {
      backgroundColor: "",
      foregroundColor: ""
    }
  },
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const orgAccountSlice = createSlice({
  name: "orgaccount",
  initialState,
  reducers: {
    resetOrgAccount: (state) => {
      Object.assign(state, initialState);
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(orgSignUp.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(orgSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orgData = action.payload;
      })
      .addCase(orgSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetOrgAccount } = orgAccountSlice.actions;
export default orgAccountSlice.reducer;
