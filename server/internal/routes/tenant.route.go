package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saml_sso/internal/services"
)

func TenantRoutes(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/tenants/:id", func(c *gin.Context) {
		services.GetTenantByID(c, db)
	})

}
