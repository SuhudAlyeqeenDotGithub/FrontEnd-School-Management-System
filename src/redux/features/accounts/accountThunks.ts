import { createAsyncThunk } from "@reduxjs/toolkit";
import { SignInType, OrgSignUpType, AccountType } from "@/interfaces/interfaces";
import axios from "axios";

const orgSignUp = createAsyncThunk<AccountType, OrgSignUpType>(
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

const signIn = createAsyncThunk<AccountType, SignInType>(
  "orgaccount/signin",
  async (signInData, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5000/api/orgaccount/signin", signInData, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

export { orgSignUp, signIn };
