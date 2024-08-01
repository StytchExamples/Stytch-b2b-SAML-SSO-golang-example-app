import { combineReducers } from "@reduxjs/toolkit";
import { memberReducer } from "./member.reducer";
import { tenantReducer } from "./tenant.reducer";
import { dashboardReducer } from "./dashboard.reducer";

export const rootReducer = combineReducers({
  memberReducer,
  tenantReducer,
  dashboardReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
