import { createSlice } from "@reduxjs/toolkit";
import { fetchRolesAccess } from "./roleThunks";
import { ReturnRoleType } from "@/interfaces/interfaces";

interface RolesState {
  roles: ReturnRoleType[];
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: RolesState = {
  roles: [],
  isSuccess: false,
  isLoading: false,
  isError: false,
  errorMessage: ""
};

export const rolesAndAccessSlice = createSlice({
  name: "rolesandaccess",
  initialState,
  reducers: {
    resetRoles: (state) => {
      Object.assign(state, initialState);
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesAccess.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchRolesAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = action.payload;
      })
      .addCase(fetchRolesAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  }
});

export const { resetRoles } = rolesAndAccessSlice.actions;
export default rolesAndAccessSlice.reducer;
