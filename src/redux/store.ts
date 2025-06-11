import { configureStore } from "@reduxjs/toolkit";
import orgAccountReducer from "./features/accounts/orgSlice";

export const makeStore = () => {
  return configureStore({ reducer: { orgAccountData: orgAccountReducer } });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
