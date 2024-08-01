import { TenantInterface } from "../interface";
import { SET_TENANT } from "./action.types";

export interface SetTenantAction {
  type: typeof SET_TENANT;
  payload: TenantInterface;
}

// Action creator to set tenant
export const setTenant = (tenant: TenantInterface): SetTenantAction => ({
  type: SET_TENANT,
  payload: tenant,
});
