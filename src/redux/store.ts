import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./features/accounts/accountSlice";
import rolesAndAccessReducer from "./features/admin/roles/roleSlice";
import usersReducer from "./features/admin/users/usersSlice";
import staffReducer from "./features/staff/staffSlice";
import generalReducer from "./features/general/generalSlice";
import staffContractReducer from "./features/staff/contractSlice";
import academicYearReducer from "./features/general/academicYear/academicYearSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      accountData: accountReducer,
      rolesAccess: rolesAndAccessReducer,
      usersData: usersReducer,
      generalState: generalReducer,
      staffData: staffReducer,
      staffContract: staffContractReducer,
      academicYear: academicYearReducer
    }
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
