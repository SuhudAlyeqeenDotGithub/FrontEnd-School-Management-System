import { createSlice } from "@reduxjs/toolkit";
import { getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from "./academicYearThunk";
import { ReturnAcademicYearType } from "@/interfaces/interfaces";

interface AcademicYearState {
  academicYears: ReturnAcademicYearType[];
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: AcademicYearState = {
  academicYears: [],
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const academicYearSlice = createSlice({
  name: "academicyears",
  initialState,
  reducers: {
    resetAcademicYear: (state) => {
      Object.assign(state, initialState);
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAcademicYears.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getAcademicYears.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicYears = action.payload;
      })
      .addCase(getAcademicYears.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(createAcademicYear.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createAcademicYear.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicYears = action.payload;
      })
      .addCase(createAcademicYear.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateAcademicYear.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(updateAcademicYear.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicYears = action.payload;
      })
      .addCase(updateAcademicYear.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(deleteAcademicYear.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(deleteAcademicYear.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicYears = action.payload;
      })
      .addCase(deleteAcademicYear.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetAcademicYear } = academicYearSlice.actions;
export default academicYearSlice.reducer;
