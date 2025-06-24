import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnRoleType, ParamRoleType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";

export const fetchRolesAccess = createAsyncThunk<ReturnRoleType[]>(
  "orgaccount/fetchrolesacess",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", "http://localhost:5000/alyeqeenschoolapp/api/admin/getroles");

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error fetching roles and access");
    }
  }
);

export const createRole = createAsyncThunk<ReturnRoleType[], ParamRoleType>(
  "orgaccount/fetchrolesacess",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "post",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/createrole",
        roleData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);

export const updateRole = createAsyncThunk<ReturnRoleType[], ParamRoleType>(
  "orgaccount/fetchrolesacess",
  async (roleUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/updaterole",
        roleUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);
