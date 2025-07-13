import { createSlice } from "@reduxjs/toolkit";

const initialState: {
  hasBeforeUnloadListener: boolean;
  triggerUnsavedDialog: boolean;

  proceedUrl: string;
  onOpenRoleData: any;
  academicYearOnFocus: string;
} = {
  hasBeforeUnloadListener: false,
  triggerUnsavedDialog: false,
  proceedUrl: "",
  onOpenRoleData: {},
  academicYearOnFocus: ""
};

export const generalSlice = createSlice({
  name: "rolesandaccess",
  initialState,
  reducers: {
    setHasBeforeUnloadListener: (state, action) => {
      state.hasBeforeUnloadListener = action.payload;
    },
    setTriggerUnsavedDialog: (state, action) => {
      state.triggerUnsavedDialog = action.payload;
    },
    setProceedUrl: (state, action) => {
      state.proceedUrl = action.payload;
    },
    setOnOpenRoleData: (state, action) => {
      state.onOpenRoleData = action.payload;
    },
    setAcademicYearOnFocus: (state, action) => {
      state.academicYearOnFocus = action.payload;
    }
  }
});

export const {
  setHasBeforeUnloadListener,
  setTriggerUnsavedDialog,
  setProceedUrl,
  setOnOpenRoleData,
  setAcademicYearOnFocus
} = generalSlice.actions;
export default generalSlice.reducer;
