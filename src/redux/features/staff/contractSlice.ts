import { createSlice } from "@reduxjs/toolkit";
import { getStaffContracts, createStaffContract, updateStaffContract, deleteStaffContract } from "./contractThunk";
import { ReturnStaffContractType } from "@/interfaces/interfaces";

interface StaffState {
  staffContracts: ReturnStaffContractType[];
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: StaffState = {
  staffContracts: [],
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const staffContractSlice = createSlice({
  name: "staffcontracts",
  initialState,
  reducers: {
    resetStaffContract: (state) => {
      Object.assign(state, initialState);
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getStaffContracts.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getStaffContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staffContracts = action.payload;
      })
      .addCase(getStaffContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(createStaffContract.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createStaffContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staffContracts = action.payload;
      })
      .addCase(createStaffContract.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateStaffContract.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(updateStaffContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staffContracts = action.payload;
      })
      .addCase(updateStaffContract.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(deleteStaffContract.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(deleteStaffContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staffContracts = action.payload;
      })
      .addCase(deleteStaffContract.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetStaffContract } = staffContractSlice.actions;
export default staffContractSlice.reducer;
