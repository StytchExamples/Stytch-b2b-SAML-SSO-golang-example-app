import { SET_DASHBOARD_INTERFACE, SetDashboardAction } from "../actions";

const initialState = {
  activeSection: "Profile",
};

export const dashboardReducer = (
  state = initialState,
  action: SetDashboardAction
) => {
  switch (action.type) {
    case SET_DASHBOARD_INTERFACE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
