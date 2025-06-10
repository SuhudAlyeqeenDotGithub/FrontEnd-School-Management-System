import { createAsyncThunk } from "@reduxjs/toolkit";
import { OrgSignInType, OrgSignUpType, OrgType } from "@/interfaces/interfaces";
import axios from "axios";

const orgSignUp = createAsyncThunk<OrgType, OrgSignUpType>(
  "orgaccount/signup",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await axios.post("alyeqeenschoolapp/api/orgaccount/signup", orgData, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

const orgSignIn = createAsyncThunk<OrgType, OrgSignInType>(
  "orgaccount/signin",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await axios.post("alyeqeenschoolapp/api/orgaccount/signin", orgData, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || error.message);
    }
  }
);

export { orgSignUp, orgSignIn };
