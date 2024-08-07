package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"saml_sso/internal/models"
)

func Connect() (*gorm.DB, error) {
	dbPath := "./mydatabase.db"
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	db.AutoMigrate(&models.Tenant{}, &models.Member{})

	return db, nil
}
