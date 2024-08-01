export interface MemberInterface {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  email: string;
  tenant_id: number;
  stytch_member_id: string;
  roles: string[];
}
