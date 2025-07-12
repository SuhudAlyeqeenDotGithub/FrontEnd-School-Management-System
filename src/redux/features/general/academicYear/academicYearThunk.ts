import { createAsyncThunk } from "@reduxjs/toolkit";
import { ParamAcademicYearType, ReturnAcademicYearType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const getAcademicYears = createAsyncThunk<ReturnAcademicYearType[]>(
  "orgaccount/getacademicyears",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", `${BASE_API_URL}/alyeqeenschoolapp/api/academicyears`);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error fetching academic years");
    }
  }
);

export const createAcademicYear = createAsyncThunk<ReturnAcademicYearType[], ParamAcademicYearType>(
  "orgaccount/createacademicyear",
  async (academicYearData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "post",
        `${BASE_API_URL}/alyeqeenschoolapp/api/academicyears`,
        academicYearData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating academic year");
    }
  }
);

export const updateAcademicYear = createAsyncThunk<ReturnAcademicYearType[], ParamAcademicYearType>(
  "orgaccount/updateacademicyear",
  async (academicYearUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        `${BASE_API_URL}/alyeqeenschoolapp/api/academicyears`,
        academicYearUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error updating academic year");
    }
  }
);

export const deleteAcademicYear = createAsyncThunk<ReturnAcademicYearType[], { academicYearIdToDelete: string }>(
  "orgaccount/deleteacademicyear",
  async (academicYearDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        `${BASE_API_URL}/alyeqeenschoolapp/api/academicyears`,
        academicYearDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting academic year");
    }
  }
);
