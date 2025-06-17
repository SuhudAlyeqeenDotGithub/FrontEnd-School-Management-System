import { createAsyncThunk } from "@reduxjs/toolkit";
import { SignInType, OrgSignUpType, AccountType, ResetPasswordType } from "@/interfaces/interfaces";
import axios from "axios";
import { handleApiRequest } from "@/axios/axiosClient";

export const orgSignUp = createAsyncThunk<AccountType, OrgSignUpType>(
  "orgaccount/signup",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5000/alyeqeenschoolapp/api/orgaccount/signup", orgData, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message || "An error occurred during signup");
    }
  }
);

export const signIn = createAsyncThunk<AccountType, SignInType>(
  "orgaccount/signin",
  async (signInData, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5000/alyeqeenschoolapp/api/orgaccount/signin", signInData, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

export const fetchAccount = createAsyncThunk<AccountType>("orgaccount/fetchAccount", async (_, { rejectWithValue }) => {
  try {
    const response = await handleApiRequest(
      "get",
      "http://localhost:5000/alyeqeenschoolapp/api/orgaccount/fetchAccount"
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data.message || error.message);
  }
});

export const setNewPassword = createAsyncThunk<AccountType, ResetPasswordType>(
  "orgaccount/setnewpassword",
  async (newPasswordData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/alyeqeenschoolapp/api/orgaccount/resetpassword/newpassword",
        newPasswordData,
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);
