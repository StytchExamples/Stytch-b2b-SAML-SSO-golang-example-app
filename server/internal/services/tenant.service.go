package services

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saml_sso/internal/models"
	"saml_sso/internal/utils"
)

// GetTenantByID retrieves a tenant by ID
func GetTenantByID(c *gin.Context, db *gorm.DB) {
	id := c.Param("id")

	var tenant models.Tenant
	result := db.First(&tenant, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			utils.NotFound(c, "Tenant not found")
		} else {
			utils.InternalServerError(c, "Error retrieving tenant")
		}
		return
	}

	utils.OK(c, tenant)
}
