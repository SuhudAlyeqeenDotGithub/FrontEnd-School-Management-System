import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnRoleType, ParamRoleType, DeleteParamRoleType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const fetchRolesAccess = createAsyncThunk<ReturnRoleType[]>(
  "orgaccount/fetchrolesaccess",
  async (_, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("get", `${BASE_API_URL}/alyeqeenschoolapp/api/admin/getroles`);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error fetching roles and access");
    }
  }
);

export const createRole = createAsyncThunk<ReturnRoleType[], ParamRoleType>(
  "orgaccount/createrolesaccess",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest("post", `${BASE_API_URL}/alyeqeenschoolapp/api/admin/createrole`, roleData);

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);

export const updateRole = createAsyncThunk<ReturnRoleType[], ParamRoleType>(
  "orgaccount/updaterolesaccess",
  async (roleUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        `${BASE_API_URL}/alyeqeenschoolapp/api/admin/updaterole`,
        roleUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);

export const deleteRole = createAsyncThunk<ReturnRoleType[], DeleteParamRoleType>(
  "orgaccount/deleterolesaccess",
  async (roleDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        `${BASE_API_URL}/alyeqeenschoolapp/api/admin/deleterole`,
        roleDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting role");
    }
  }
);
