package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saml_sso/internal/services"
)

func MemberRoutes(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/profile/:stytch_member_id", func(c *gin.Context) {
		services.GetMemberProfile(c, db)
	})
}
