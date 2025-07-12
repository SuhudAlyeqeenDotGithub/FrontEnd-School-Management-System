import { createAsyncThunk } from "@reduxjs/toolkit";
import { ParamStaffContractType, ReturnStaffContractType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const getStaffContracts = createAsyncThunk<ReturnStaffContractType[]>(
  "orgaccount/getstaffcontracts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", `${BASE_API_URL}/alyeqeenschoolapp/api/staff/contracts`);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error fetching staff");
    }
  }
);

export const createStaffContract = createAsyncThunk<ReturnStaffContractType[], ParamStaffContractType>(
  "orgaccount/createstaffcontract",
  async (staffContractData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "post",
        `${BASE_API_URL}/alyeqeenschoolapp/api/staff/contracts`,
        staffContractData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating staff");
    }
  }
);

export const updateStaffContract = createAsyncThunk<ReturnStaffContractType[], ParamStaffContractType>(
  "orgaccount/updatestaffcontract",
  async (staffUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        `${BASE_API_URL}/alyeqeenschoolapp/api/staff/contracts`,
        staffUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating staff");
    }
  }
);

export const deleteStaffContract = createAsyncThunk<ReturnStaffContractType[], { staffContractIdToDelete: string }>(
  "orgaccount/deletestaffcontract",
  async (staffDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        `${BASE_API_URL}/alyeqeenschoolapp/api/staff/contracts`,
        staffDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting staff");
    }
  }
);
