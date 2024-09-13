package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// OK sends a 200 OK response
func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   data,
	})
}

// BadRequest sends a 400 Bad Request response
func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"status":  "error",
		"message": message,
	})
}

// NotFound sends a 404 Not Found response

// InternalServerError sends a 500 Internal Server Error response
func InternalServerError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"status":  "error",
		"message": message,
	})
}
