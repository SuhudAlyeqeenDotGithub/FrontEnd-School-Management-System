import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnUserType, ParamUserType, DeleteParamUserType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";

export const getUsers = createAsyncThunk<ReturnUserType[]>("orgaccount/getusers", async (_, { rejectWithValue }) => {
  try {
    const response = await handleApiRequest("get", "http://localhost:5000/alyeqeenschoolapp/api/admin/getusers");

    return response?.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data.message || error.message || "Error fetching roles and access");
  }
});

export const createUser = createAsyncThunk<ReturnUserType[], ParamUserType>(
  "orgaccount/createuser",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "post",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/createuser",
        roleData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);

export const updateUser = createAsyncThunk<ReturnUserType[], ParamUserType>(
  "orgaccount/updateuser",
  async (roleUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/updateuser",
        roleUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating role");
    }
  }
);

export const deleteUser = createAsyncThunk<ReturnUserType[], DeleteParamUserType>(
  "orgaccount/deleteuser",
  async (roleDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/deleteuser",
        roleDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting role");
    }
  }
);
