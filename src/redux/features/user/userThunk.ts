import { createAsyncThunk } from "@reduxjs/toolkit";
import { OrgSignInType, OrgSignUpType, OrgType } from "@/interfaces/interfaces";
import axios from "axios";

const signUp = createAsyncThunk<OrgType, OrgSignUpType>("user/signup", async (orgData, { rejectWithValue }) => {
  try {
    const response = await axios.post("alyeqeenschoolapp/api/users/signup", orgData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const typedError = error as any;
    return rejectWithValue(typedError.response?.data.message || typedError.message);
  }
});

const signIn = createAsyncThunk<OrgType, OrgSignInType>("user/signin", async (orgData, { rejectWithValue }) => {
  try {
    const response = await axios.post("alyeqeenschoolapp/api/users/signin", orgData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const typedError = error as any;
    return rejectWithValue(typedError.response?.data.message || typedError.message);
  }
});

export { signUp, signIn };
