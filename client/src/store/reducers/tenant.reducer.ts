import { SET_TENANT, SetTenantAction } from "../actions";
import { TenantInterface } from "../interface";

const initialState: { tenant: TenantInterface } = {
  tenant: {
    ID: null,
    CreatedAt: "",
    UpdatedAt: "",
    DeletedAt: null,
    connection_id: "",
    stytch_organization_id: "",
    idp_sign_on_url: "",
    idp_issuer_url: "",
    stytch_audience_url: "",
    stytch_acs_url: "",
    stytch_issuer_url: "",
    company_name: "",
  },
};

export const tenantReducer = (
  state = initialState,
  action: SetTenantAction
) => {
  switch (action.type) {
    case SET_TENANT:
      return {
        ...state,
        tenant: action.payload,
      };
    default:
      return state;
  }
};
