package database

import (
	"fmt"
	"log"
	"os"

	"satbaria-college/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("✅ Database connected successfully")
	Migrate()
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.Teacher{},
		&models.Staff{},
		&models.Notice{},
		&models.GalleryImage{},
		&models.Result{},
		&models.Class{},
		&models.Group{},
		&models.StudentSummary{},
		&models.Feedback{},
		&models.Admin{},
		&models.CollegeInfo{},
	)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("✅ Database migrated successfully")
	Seed()
}

func Seed() {
	// Seed default CollegeInfo if not exists
	var count int64
	DB.Model(&models.CollegeInfo{}).Count(&count)
	if count == 0 {
		DB.Create(&models.CollegeInfo{
			Name:    "Satbaria Degree College",
			EstYear: "1966",
			EIIN:    "125731",
			Address: "Sujanagar, Pabna",
			Mobile:  "+880-XXXXXXXXXX",
			Email:   "info@satbariacollege.edu.bd",
			About:   "Satbaria Degree College is a prestigious institution of higher education located in Sujanagar, Pabna, Bangladesh, established in 1966.",
			History: "Founded in 1966, Satbaria Degree College has been a beacon of education in the Sujanagar Upazila of Pabna district for over five decades.",
		})
	}
}
