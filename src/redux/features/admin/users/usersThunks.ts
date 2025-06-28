import { createAsyncThunk } from "@reduxjs/toolkit";
import { ReturnUserType, ParamUserType, DeleteParamUserType } from "@/interfaces/interfaces";
import { handleApiRequest } from "@/axios/axiosClient";

export const getUsers = createAsyncThunk<ReturnUserType[]>("orgaccount/getusers", async (_, { rejectWithValue }) => {
  try {
    const response = await handleApiRequest("get", "http://localhost:5000/alyeqeenschoolapp/api/admin/getusers");

    return response?.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data.message || error.message || "Error fetching users and access");
  }
});

export const createUser = createAsyncThunk<ReturnUserType[], ParamUserType>(
  "orgaccount/createuser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "post",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/createuser",
        userData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating user");
    }
  }
);

export const updateUser = createAsyncThunk<ReturnUserType[], ParamUserType>(
  "orgaccount/updateuser",
  async (userUpdateData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "put",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/updateuser",
        userUpdateData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error creating user");
    }
  }
);

export const deleteUser = createAsyncThunk<ReturnUserType[], DeleteParamUserType>(
  "orgaccount/deleteuser",
  async (userDeleteData, { rejectWithValue }) => {
    try {
      const response = await handleApiRequest(
        "delete",
        "http://localhost:5000/alyeqeenschoolapp/api/admin/deleteuser",
        userDeleteData
      );

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "Error deleting user");
    }
  }
);
