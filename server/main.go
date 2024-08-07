package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"saml_sso/internal/database"
	routes "saml_sso/internal/routes"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db, databaseErr := database.Connect()

	if databaseErr != nil {
		// Handle error
		log.Fatal("Something went wrong connecting to database")
	}

	PORT := os.Getenv("PORT")

	r := gin.Default()

	corsConfig := cors.Config{
		AllowOrigins:     []string{"*"},                                                 // Allow all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},                      // Allow specific methods
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "authorization"}, // Allow specific headers
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	r.Use(cors.New(corsConfig))

	apiV1 := r.Group("/api/v1")
	{
		routes.TenantRoutes(apiV1, db)

		routes.MemberRoutes(apiV1, db)

		routes.AuthRoutes(apiV1, db)
	}

	fmt.Println("Server is listening on port", PORT)
	r.Run(PORT)
}
