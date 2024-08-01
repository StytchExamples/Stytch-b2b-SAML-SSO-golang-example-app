export interface TenantInterface {
  ID: number | null;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  connection_id: string;
  stytch_organization_id: string;
  idp_sign_on_url: string;
  idp_issuer_url: string;
  stytch_audience_url: string;
  stytch_acs_url: string;
  stytch_issuer_url: string;
  company_name: string;
}
