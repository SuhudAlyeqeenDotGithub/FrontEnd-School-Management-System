import { createAsyncThunk } from "@reduxjs/toolkit";
import { RoleType } from "@/interfaces/interfaces";
import axios from "axios";
import { handleApiRequest } from "@/axios/axiosClient";

export const fetchRolesAccess = createAsyncThunk<RoleType[]>(
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
