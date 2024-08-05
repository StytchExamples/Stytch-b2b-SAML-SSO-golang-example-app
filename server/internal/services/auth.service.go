package services

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/b2bstytchapi"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/organizations"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/organizations/members"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/sso/saml"
	"gorm.io/gorm"

	"saml_sso/internal/models"
	"saml_sso/internal/utils"
)

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

type SignInInputInput struct {
	Email        string `json:"email"`
	SignInMethod string `json:"sign_in_method"`
}

// Authenticate handles member authentication
func Authenticate(c *gin.Context, db *gorm.DB) {
	PROJECT_ID := os.Getenv("STYTCH_PROJECT_ID")
	SECRET_KEY := os.Getenv("STYTCH_SECRET_KEY")

	stytch_organization_id := c.Query("stytch_organization_id")
	stytch_member_id := c.Query("stytch_member_id")

	client, err := b2bstytchapi.NewClient(
		PROJECT_ID,
		SECRET_KEY,
	)

	if err != nil {
		utils.InternalServerError(c, fmt.Sprintf("Error instantiating API client: %s", err))
		return
	}

	var tenant models.Tenant
	var member models.Member

	resultTenant := db.First(&tenant, "stytch_organization_id = ?", stytch_organization_id)

	if resultTenant.Error != nil {
		utils.BadRequest(c, "Organization not found")
		return
	}

	resultMember := db.First(&member, "stytch_member_id = ?", stytch_member_id)
	fmt.Println(resultMember)
	if resultMember.Error != nil {

		params := &members.GetParams{
			MemberID:       stytch_member_id,
			OrganizationID: stytch_organization_id,
		}
		fmt.Println(params)
		resp, err := client.Organizations.Members.Get(context.Background(), params)

		fmt.Println(err)

		if err != nil {
			utils.Unauthorized(c, err.Error())
			return
		}

		fmt.Println("stytch_member_if", resp.Member.MemberID)

		if resp.Member.Name == "" {
			member := &models.Member{
				Email:          resp.Member.EmailAddress,
				TenantID:       tenant.ID,
				StytchMemberID: resp.Member.MemberID,
			}
			fmt.Println(member.StytchMemberID)
			db.Create(&member)
		} else {
			member := &models.Member{
				FirstName:      strings.Split(resp.Member.Name, " ")[0],
				LastName:       strings.Split(resp.Member.Name, " ")[1],
				Email:          resp.Member.EmailAddress,
				TenantID:       tenant.ID,
				StytchMemberID: resp.Member.MemberID,
			}
			db.Create(member)
		}

	}

	utils.Created(c, gin.H{"message": "Member authenticated successfully"})
}

func SignUp(c *gin.Context, db *gorm.DB) {

	PROJECT_ID := os.Getenv("STYTCH_PROJECT_ID")
	SECRET_KEY := os.Getenv("STYTCH_SECRET_KEY")

	client, error := b2bstytchapi.NewClient(
		PROJECT_ID,
		SECRET_KEY,
	)
	fmt.Println(error)

	var createTenantInput CreateTenantInput

	c.BindJSON(&createTenantInput)

	CompanyName := createTenantInput.CompanyName

	parts := strings.Split(createTenantInput.Email, "@")

	allowedDomains := []string{parts[1]}

	// Create a new tenant object
	tenant := &models.Tenant{
		CompanyName: createTenantInput.CompanyName,
		Domain:      parts[1],
	}

	tenantExist := db.Where("company_name = ? OR domain = ?", CompanyName, parts[1]).First(&tenant)

	fmt.Println(tenantExist)

	if tenantExist.RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Organization already exists"})
		return
	}

	memberExist := db.First(&models.Member{Email: createTenantInput.Email})

	if memberExist.RowsAffected > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Member already exists"})
		return
	}

	createdTenant := db.Create(tenant)

	fmt.Println(createdTenant)
	if createdTenant.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": createdTenant.Error.Error()})
		return
	}

	member := &models.Member{
		FirstName: createTenantInput.FirstName,
		LastName:  createTenantInput.LastName,
		Email:     createTenantInput.Email,
		TenantID:  tenant.ID,
	}

	createdMember := db.Create(member)

	if createdMember.Error != nil {
		db.Delete(&tenant)
		c.JSON(http.StatusUnauthorized, gin.H{"error": createdMember.Error.Error()})
		return
	}

	createOrgParams := &organizations.CreateParams{
		OrganizationName:     tenant.CompanyName,
		OrganizationSlug:     tenant.CompanyName,
		EmailJITProvisioning: "RESTRICTED",
		EmailAllowedDomains:  allowedDomains,
	}

	if client.Organizations == nil {
		log.Panic("client.Organizations is nil")
		db.Delete(&tenant)
		db.Delete(&member)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Something went wrong"})

	}

	stytchOrganization, createOrgError := client.Organizations.Create(context.Background(), createOrgParams)
	if createOrgError != nil {
		db.Delete(&tenant)
		db.Delete(&member)
		c.JSON(http.StatusBadRequest, gin.H{"message": createOrgError.Error()})
	}

	createMemberParams := &members.CreateParams{
		OrganizationID: stytchOrganization.Organization.OrganizationID,
		EmailAddress:   member.Email,
	}

	createMemberResponse, createMemberError := client.Organizations.Members.Create(context.Background(), createMemberParams)
	if createMemberError != nil {
		db.Delete(&tenant)
		db.Delete(&member)
		deleteParams := &organizations.DeleteParams{
			OrganizationID: stytchOrganization.Organization.OrganizationID,
		}
		client.Organizations.Delete(context.Background(), deleteParams)
		c.JSON(http.StatusInternalServerError, gin.H{"message": createOrgError.Error()})
	}

	client.Organizations.Members.Create(context.Background(), createMemberParams)

	params := &saml.CreateConnectionParams{
		OrganizationID: stytchOrganization.Organization.OrganizationID,
		DisplayName:    tenant.CompanyName + "-SAML",
	}

	createdConnection, createConnError := client.SSO.SAML.CreateConnection(context.Background(), params)

	if createConnError != nil {

		db.Delete(&tenant)
		db.Delete(&member)
		deleteParams := &organizations.DeleteParams{
			OrganizationID: stytchOrganization.Organization.OrganizationID,
		}
		client.Organizations.Delete(context.Background(), deleteParams)
		c.JSON(http.StatusInternalServerError, gin.H{"message": createConnError.Error()})

	}

	tenantUpdates := map[string]interface{}{
		"StytchOrganizationId": createdConnection.Connection.OrganizationID,
		"StytchAcsUrl":         createdConnection.Connection.AcsURL,
		"StytchAudienceUrl":    createdConnection.Connection.AudienceURI,
		"ConnectionID":         createdConnection.Connection.ConnectionID,
	}

	memberUpdates := map[string]interface{}{
		"StytchMemberID": createMemberResponse.Member.MemberID,
	}

	if err := db.Model(&tenant).Updates(tenantUpdates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong with updating organization"})

	}

	if err := db.Model(&member).Updates(memberUpdates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong with updating member details"})
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   gin.H{"message": "Sign up successful"},
	})

}

func UpdateSamlConnection(c *gin.Context, db *gorm.DB) {
	PROJECT_ID := os.Getenv("STYTCH_PROJECT_ID")
	SECRET_KEY := os.Getenv("STYTCH_SECRET_KEY")

	client, _ := b2bstytchapi.NewClient(
		PROJECT_ID,
		SECRET_KEY,
	)

	id := c.Param("id")

	var tenant models.Tenant
	result := db.First(&tenant, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			utils.NotFound(c, "Organization not found")
		} else {
			utils.InternalServerError(c, "Error retrieving organization")
		}
		return
	}

	var updateConnectionInput UpdateSamlConnectionInput
	if err := c.BindJSON(&updateConnectionInput); err != nil {
		utils.BadRequest(c, "Invalid input data")
		return
	}

	attributeMapping := map[string]any{
		"first_name": "user.firstName",
		"last_name":  "user.lastName",
		"email":      "NameID",
	}

	updateConnectionParams := &saml.UpdateConnectionParams{
		OrganizationID:   tenant.StytchOrganizationId,
		X509Certificate:  updateConnectionInput.SigningCertificate,
		IdpSSOURL:        updateConnectionInput.IdpSignOnUrl,
		ConnectionID:     tenant.ConnectionID,
		IdpEntityID:      updateConnectionInput.IdpIssuerUrl,
		AttributeMapping: attributeMapping,
	}

	_, updateConnectionError := client.SSO.SAML.UpdateConnection(context.Background(), updateConnectionParams)
	if updateConnectionError != nil {
		utils.InternalServerError(c, "Error updating SAML connection")
		return
	}

	tenantUpdates := map[string]interface{}{
		"IdpSignOnUrl": updateConnectionInput.IdpSignOnUrl,
		"IdpIssuerUrl": updateConnectionInput.IdpIssuerUrl,
	}

	if err := db.Model(&tenant).Updates(tenantUpdates).Error; err != nil {
		utils.InternalServerError(c, "Something went wrong with updating organization")
	}

	utils.OK(c, "SAML connection updated successfully")
}

// SignIn retrieves the Stytch organization ID by email
func SignIn(c *gin.Context, db *gorm.DB) {

	var signInInput SignInInputInput
	if err := c.BindJSON(&signInInput); err != nil {
		utils.BadRequest(c, "Invalid input data")
		return
	}

	var tenant models.Tenant
	var member models.Member

	parts := strings.Split(signInInput.Email, "@")

	tenantExist := db.Where("domain = ?", parts[1]).First(&tenant)

	memberExistError := db.Where("email = ?", signInInput.Email).First(&member).Error

	if tenantExist.Error != nil {
		if tenantExist.Error == gorm.ErrRecordNotFound {
			utils.NotFound(c, "Organization not found")
		} else {
			utils.InternalServerError(c, "Error retrieving organization")
		}
		return
	}
	if signInInput.SignInMethod == "SAML" {
		if tenant.IdpIssuerUrl == "" {
			utils.BadRequest(c, "This user does not have SAML provisioned")
			return
		}
		utils.OK(c, gin.H{"connection_id": tenant.ConnectionID})
		return
	} else if signInInput.SignInMethod == "MagicLink" {

		if memberExistError == nil {
			utils.OK(c, gin.H{"organization_id": tenant.StytchOrganizationId})
		}

		if memberExistError != nil && tenant.IdpIssuerUrl != "" {
			utils.BadRequest(c, "This organization has SAML provisioned, please sign in with SAML SSO")
		}

		if memberExistError != nil && tenant.IdpIssuerUrl == "" {

			utils.BadRequest(c, "Member does not exist")
		}

	} else {
		utils.BadRequest(c, "Invalid sign in method")
	}

}