package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"saml_sso/internal/services"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
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

	r.GET("/authenticate", func(c *gin.Context) {
		services.Authenticate(c)
	})

	fmt.Println("Server is listening on port", PORT)
	r.Run(PORT)
}
