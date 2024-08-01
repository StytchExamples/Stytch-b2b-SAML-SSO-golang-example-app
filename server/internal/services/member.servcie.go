package services

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saml_sso/internal/models"
	"saml_sso/internal/utils"
)

// GetUserProfile retrieves a user's profile
func GetUserProfile(c *gin.Context, db *gorm.DB) {
	stytch_member_id := c.Param("stytch_member_id")

	var member models.Member
	result := db.Preload("Tenant").First(&member, "stytch_member_id = ?", stytch_member_id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			utils.NotFound(c, "Member not found")
		} else {
			utils.InternalServerError(c, "Error retrieving member")
		}
		return
	}

	utils.OK(c, gin.H{"member": member})
}

// GetUserProfile retrieves a user's profile
func GetMemberWithEmail(c *gin.Context, db *gorm.DB, email *string) {

	var member models.Member
	result := db.Preload("Tenant").First(&member, "email = ?", email)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			utils.NotFound(c, "Member not found")
		} else {
			utils.InternalServerError(c, "Error retrieving member")
		}
		return
	}

	utils.OK(c, gin.H{"member": member})
}
