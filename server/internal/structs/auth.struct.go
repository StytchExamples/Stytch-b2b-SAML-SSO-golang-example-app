package structs

type CreateTenantInput struct {
	CompanyName string `json:"company_name"`
	FirstName   string `json:"last_name"`
	LastName    string `json:"first_name"`
	Email       string `json:"email"`
}
