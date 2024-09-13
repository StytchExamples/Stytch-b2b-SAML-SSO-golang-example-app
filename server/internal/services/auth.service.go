package services

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/b2bstytchapi"
	"github.com/stytchauth/stytch-go/v12/stytch/b2b/sso"

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

// Authenticate handles member authentication
func Authenticate(c *gin.Context) {

	token := c.Query("token")

	if token == "" {
		utils.BadRequest(c, "Provide authentication token")
	}

	params := &sso.AuthenticateParams{
		SSOToken: token,
	}
	resp, err := stytchClient.SSO.Authenticate(c.Request.Context(), params)
	if err != nil {
		log.Printf("Error authenticating token: %v", err)
		utils.InternalServerError(c, "Error authenticating token")
		return
	}

	utils.OK(c, gin.H{
		"SessionToken": resp.SessionToken,
		"SessionJWT":   resp.SessionJWT,
	})

}
