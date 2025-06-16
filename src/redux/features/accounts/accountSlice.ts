import { createSlice } from "@reduxjs/toolkit";
import { orgSignUp, signIn, setNewPassword, fetchAccount } from "./accountThunks";
import { AccountType } from "@/interfaces/interfaces";

interface OrgState {
  accountData: AccountType;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: OrgState = {
  accountData: {
    accountId: {},
    accountStatus: "",
    staffId: {},
    accountType: "",
    accountName: "",
    accountEmail: "",
    accountPhone: "",
    organisationId: {},
    themes: {
      backgroundColor: "",
      foregroundColor: ""
    },
    roleId: {
      tabAccess: {},
      _id: "",
      organisationId: "",
      roleName: "",
      roleDescription: "",
      absoluteAdmin: false
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
    resetAccount: (state) => {
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
        state.accountData = action.payload;
      })
      .addCase(orgSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accountData = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(setNewPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(setNewPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accountData = action.payload;
      })
      .addCase(setNewPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(fetchAccount.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accountData = action.payload;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetAccount } = orgAccountSlice.actions;
export default orgAccountSlice.reducer;
