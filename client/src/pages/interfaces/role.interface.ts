export type RoleSource =
  | {
      type: "direct_assignment";
      details: Record<string, never>;
    }
  | {
      type: "email_assignment";
      details: {
        email_domain: string;
      };
    }
  | {
      type: "sso_connection";
      details: {
        connection_id: string;
      };
    }
  | {
      type: "sso_connection_group";
      details: {
        connection_id: string;
        group: string;
      };
    };
