import { SET_DASHBOARD_INTERFACE } from "./action.types";
import { DashboardInterface } from "../interface";

export interface SetDashboardAction {
  type: typeof SET_DASHBOARD_INTERFACE;
  payload: DashboardInterface;
}

export const setDashboard = (
  dashboard: DashboardInterface
): SetDashboardAction => ({
  type: SET_DASHBOARD_INTERFACE,
  payload: dashboard,
});
