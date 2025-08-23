import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnStaffType, ParamStaffType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const getStaffProfiles = createAsyncThunk<ReturnStaffType[]>(
  "orgaccount/getstaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", `alyeqeenschoolapp/api/staff/profile.tss`);

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
      const response = await handleApiRequest("post", `alyeqeenschoolapp/api/staff/profile.tss`, staffData);

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
      const response = await handleApiRequest("put", `alyeqeenschoolapp/api/staff/profile.tss`, staffUpdateData);

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
      const response = await handleApiRequest("delete", `alyeqeenschoolapp/api/staff/profile.tss`, staffDeleteData);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting staff");
    }
  }
);
