import { configureStore } from "@reduxjs/toolkit";
import userAccountReducer from "./features/accounts/userSlice";
import orgAccountReducer from "./features/accounts/orgSlice";

export const makeStore = () => {
  return configureStore({ reducer: { userData: userAccountReducer, orgData: orgAccountReducer } });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
