import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnStaffType, ParamStaffType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const getStaffProfiles = createAsyncThunk<ReturnStaffType[]>(
  "orgaccount/getstaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", `${BASE_API_URL}/alyeqeenschoolapp/api/staff/profiles`);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error fetching staff");
    }
  }
);

export const createStaffProfile = createAsyncThunk<ReturnStaffType[], ParamStaffType>(
  "orgaccount/createstaff",
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("post", `${BASE_API_URL}/alyeqeenschoolapp/api/staff/profiles`, staffData);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating staff");
    }
  }
);

export const updateStaffProfile = createAsyncThunk<ReturnStaffType[], ParamStaffType>(
  "orgaccount/updatestaff",
  async (staffUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        `${BASE_API_URL}/alyeqeenschoolapp/api/staff/profiles`,
        staffUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating staff");
    }
  }
);

export const deleteStaffProfile = createAsyncThunk<ReturnStaffType[], { staffIDToDelete: string }>(
  "orgaccount/deletestaff",
  async (staffDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        `${BASE_API_URL}/alyeqeenschoolapp/api/staff/profiles`,
        staffDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting staff");
    }
  }
);
