package structs

type CreateTenantInput struct {
	CompanyName string `json:"company_name"`
	FirstName   string `json:"last_name"`
	LastName    string `json:"first_name"`
	Email       string `json:"email"`
}

type UpdateSamlConnectionInput struct {
	SigningCertificate string `json:"signing_certificate"`
	IdpSignOnUrl       string `json:"idp_sign_on_url"`
	IdpIssuerUrl       string `json:"idp_issuer_url"`
}

type SignInInput struct {
	Email        string `json:"email"`
	SignInMethod string `json:"sign_in_method"`
}
