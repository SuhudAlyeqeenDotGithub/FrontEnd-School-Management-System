import { createSlice } from "@reduxjs/toolkit";
import { getStaffProfiles, createStaffProfile, updateStaffProfile, deleteStaffProfile } from "./staffThunks";
import { ReturnStaffType } from "@/interfaces/interfaces";

interface StaffState {
  staff: ReturnStaffType[];
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: StaffState = {
  staff: [],
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    resetStaff: (state) => {
      Object.assign(state, initialState);
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getStaffProfiles.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getStaffProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = action.payload;
      })
      .addCase(getStaffProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(createStaffProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createStaffProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = action.payload;
      })
      .addCase(createStaffProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateStaffProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(updateStaffProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = action.payload;
      })
      .addCase(updateStaffProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(deleteStaffProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(deleteStaffProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = action.payload;
      })
      .addCase(deleteStaffProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetStaff } = staffSlice.actions;
export default staffSlice.reducer;
