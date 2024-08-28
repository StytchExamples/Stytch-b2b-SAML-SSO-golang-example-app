package services

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/b2bstytchapi"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/magiclinks/email"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/organizations"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/organizations/members"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/sso"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/sso/saml"
	"gorm.io/gorm"

	"saml_sso/internal/models"
	"saml_sso/internal/structs"
	"saml_sso/internal/utils"
)

var stytchClient *b2bstytchapi.API

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	PROJECT_ID := os.Getenv("STYTCH_PROJECT_ID")
	SECRET_KEY := os.Getenv("STYTCH_SECRET_KEY")

	client, err := b2bstytchapi.NewClient(
		PROJECT_ID,
		SECRET_KEY,
	)
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize Stytch client: %v", err))
	}
	stytchClient = client
}

func SignUp(c *gin.Context, db *gorm.DB) {

	var createTenantInput structs.CreateTenantInput
	c.BindJSON(&createTenantInput)

	CompanyName := createTenantInput.CompanyName
	parts := strings.Split(createTenantInput.Email, "@")
	allowedDomains := []string{parts[1]}

	// Check if tenant already exists
	var tenant models.Tenant
	tenantExist := db.Where("company_name = ? OR domain = ?", CompanyName, parts[1]).First(&tenant)

	// If tenant doesn't exist, create it and the Stytch organization
	if tenantExist.RowsAffected <= 0 {
		tenant = models.Tenant{
			CompanyName: strings.ReplaceAll(createTenantInput.CompanyName, " ", "_"),
			Domain:      parts[1],
		}

		if err := db.Create(&tenant).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		createOrgParams := &organizations.CreateParams{
			OrganizationName:     tenant.CompanyName,
			OrganizationSlug:     tenant.CompanyName,
			EmailJITProvisioning: "RESTRICTED",
			EmailAllowedDomains:  allowedDomains,
		}
		stytchOrg, err := stytchClient.Organizations.Create(context.Background(), createOrgParams)

		if err != nil {
			db.Unscoped().Where("ID = ?", tenant.ID).Delete(&models.Tenant{})
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		// Update tenant with Stytch organization details
		tenantUpdates := map[string]interface{}{
			"StytchOrganizationId": stytchOrg.Organization.OrganizationID,
		}

		if err := db.Model(&tenant).Updates(tenantUpdates).Error; err != nil {
			db.Unscoped().Where("ID = ?", tenant.ID).Delete(&models.Tenant{})
			stytchClient.Organizations.Delete(context.Background(), &organizations.DeleteParams{
				OrganizationID: stytchOrg.Organization.OrganizationID,
			})
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update tenant with Stytch details"})
			return
		}
	}

	// Check if member already exists
	var member models.Member
	memberExist := db.Where("email = ?", createTenantInput.Email).First(&member)

	if memberExist.RowsAffected > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Member already exists"})
		return
	}

	// Create the member
	member = models.Member{
		FirstName: createTenantInput.FirstName,
		LastName:  createTenantInput.LastName,
		Email:     createTenantInput.Email,
		TenantID:  tenant.ID,
	}

	if err := db.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create Stytch member
	createStytchMemberParams := &members.CreateParams{
		OrganizationID: tenant.StytchOrganizationId,
		EmailAddress:   createTenantInput.Email,
	}

	createMemberResponse, createMemberError := stytchClient.Organizations.Members.Create(context.Background(), createStytchMemberParams)
	if createMemberError != nil {
		db.Unscoped().Where("email = ?", createTenantInput.Email).Delete(&models.Member{})
		utils.InternalServerError(c, createMemberError.Error())
		return
	}

	// Update member with Stytch member ID
	memberUpdates := map[string]interface{}{
		"StytchMemberID": createMemberResponse.Member.MemberID,
	}

	if err := db.Model(&member).Updates(memberUpdates).Error; err != nil {
		db.Unscoped().Where("email = ?", createTenantInput.Email).Delete(&models.Member{})
		utils.InternalServerError(c, "Failed to update member details")
		return
	}

	// Send magic link
	sendMagicLinkparams := &email.LoginOrSignupParams{
		EmailAddress:     createTenantInput.Email,
		OrganizationID:   tenant.StytchOrganizationId,
		LoginRedirectURL: "http://localhost:3000/authenticate",
	}

	stytchClient.MagicLinks.Email.LoginOrSignup(c, sendMagicLinkparams)

	utils.Created(c, gin.H{
		"status": "success",
		"data":   gin.H{"message": "Sign Up Successful", "organization_id": tenant.StytchOrganizationId},
	})
}

func SignIn(c *gin.Context, db *gorm.DB) {

	var signInInput structs.SignInInput
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
			utils.BadRequest(c, "Your organization does not have SAML provisioned")
			return
		}
		utils.OK(c, gin.H{"connection_id": tenant.ConnectionID})
		return
	} else if signInInput.SignInMethod == "MagicLink" {

		if memberExistError == nil {
			utils.OK(c, gin.H{"organization_id": tenant.StytchOrganizationId})
		}

		if memberExistError != nil && tenant.IdpIssuerUrl != "" {
			utils.BadRequest(c, "This organization has SAML provisioned, please sign in with SAML")
		}

		if memberExistError != nil && tenant.IdpIssuerUrl == "" {

			utils.BadRequest(c, "Member does not exist")
		}

	} else {
		utils.BadRequest(c, "Invalid sign in method")
	}

}

func Authenticate(c *gin.Context, db *gorm.DB) {

	stytch_organization_id := c.Query("stytch_organization_id")
	stytch_member_id := c.Query("stytch_member_id")

	var tenant models.Tenant
	var member models.Member

	resultTenant := db.First(&tenant, "stytch_organization_id = ?", stytch_organization_id)

	if resultTenant.Error != nil {
		utils.BadRequest(c, "Organization not found")
		return
	}

	resultMember := db.First(&member, "stytch_member_id = ?", stytch_member_id)
	if resultMember.Error != nil {

		params := &members.GetParams{
			MemberID:       stytch_member_id,
			OrganizationID: stytch_organization_id,
		}
		resp, err := stytchClient.Organizations.Members.Get(context.Background(), params)

		fmt.Println(err)

		if err != nil {
			utils.Unauthorized(c, err.Error())
			return
		}

		if resp.Member.Name == "" {
			member := &models.Member{
				Email:          resp.Member.EmailAddress,
				TenantID:       tenant.ID,
				StytchMemberID: resp.Member.MemberID,
			}
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

func CreateSamlConnection(c *gin.Context, db *gorm.DB) {

	stytch_organization_id := c.Param("stytch_organization_id")
	var tenant models.Tenant
	tenantExist := db.First(&tenant, "stytch_organization_id = ?", stytch_organization_id)

	// If tenant doesn't exist, create it and the Stytch organization
	if tenantExist.RowsAffected <= 0 {
		utils.NotFound(c, "Organization not found")
		return
	}

	if tenant.ConnectionID != "" {
		utils.BadRequest(c, "Connection already exists for this organization")
		return
	}

	params := &saml.CreateConnectionParams{
		OrganizationID: stytch_organization_id,
		DisplayName:    tenant.CompanyName + "-SAML",
	}
	createdConnection, createConnError := stytchClient.SSO.SAML.CreateConnection(context.Background(), params)

	if createConnError != nil {
		utils.InternalServerError(c, createConnError.Error())
		return
	}

	tenantUpdates := map[string]interface{}{
		"StytchAcsUrl":      createdConnection.Connection.AcsURL,
		"StytchAudienceUrl": createdConnection.Connection.AudienceURI,
		"ConnectionID":      createdConnection.Connection.ConnectionID,
	}

	if err := db.Model(&tenant).Updates(tenantUpdates).Error; err != nil {
		deleteConnParams := &sso.DeleteConnectionParams{
			ConnectionID:   createdConnection.Connection.ConnectionID,
			OrganizationID: stytch_organization_id,
		}
		stytchClient.SSO.DeleteConnection(context.Background(), deleteConnParams)
		utils.InternalServerError(c, "Error updating organization")
		return
	}

	utils.Created(c, gin.H{"message": "Connection created successfully", "connection": gin.H{
		"stytch_acs_url":      createdConnection.Connection.AcsURL,
		"stytch_audience_url": createdConnection.Connection.AudienceURI,
		"connection_id":       createdConnection.Connection.ConnectionID,
	}})

}

func UpdateSamlConnection(c *gin.Context, db *gorm.DB) {

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

	var updateConnectionInput structs.UpdateSamlConnectionInput
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

	_, updateConnectionError := stytchClient.SSO.SAML.UpdateConnection(context.Background(), updateConnectionParams)
	if updateConnectionError != nil {
		utils.InternalServerError(c, "Error updating SAML connection")
		return
	}

	tenantUpdates := map[string]interface{}{
		"IdpSignOnUrl":   updateConnectionInput.IdpSignOnUrl,
		"IdpIssuerUrl":   updateConnectionInput.IdpIssuerUrl,
		"SamlConfigured": true,
	}

	if err := db.Model(&tenant).Updates(tenantUpdates).Error; err != nil {
		utils.InternalServerError(c, "Something went wrong updating organization")
	}

	utils.OK(c, "SAML connection updated successfully")
}
