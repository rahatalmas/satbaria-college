package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"satbaria-college/internal/database"
	"satbaria-college/internal/middleware"
	"satbaria-college/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	// Load env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect DB
	database.Connect()

	// Seed admin
	seedAdmin()

	// Create uploads dir
	os.MkdirAll("./uploads", 0755)

	// Setup Gin
	r := gin.Default()

	// Load HTML templates
	r.SetFuncMap(template.FuncMap{
		"add": func(a, b int) int { return a + b },
		"formatDate": func(t time.Time) string {
			return t.Format("02 Jan 2006")
		},
		"formatDateInput": func(t time.Time) string {
			if t.IsZero() {
				return ""
			}
			return t.Format("2006-01-02")
		},
	})
	r.LoadHTMLGlob("internal/static/templates/admin/*.html")
	// Fallback for systems where ** doesn't recurse
	// r.LoadHTMLGlob("internal/static/templates/admin/*.html")
	r.Static("/uploads", "./uploads")
	r.Static("/static", "./internal/static")

	// Force-download endpoint: serves an uploaded file as an attachment so the
	// browser downloads it (works cross-origin, unlike the HTML download attr).
	r.GET("/download", downloadFile)

	// CORS
	r.Use(middleware.CORSMiddleware())

	// ==================== PUBLIC API ROUTES ====================
	api := r.Group("/api/v1")
	{
		api.GET("/college-info", getCollegeInfo)
		api.GET("/teachers", getTeachers)
		api.GET("/staff", getStaff)
		api.GET("/notices", getNotices)
		api.GET("/notices/:id", getNotice)
		api.GET("/gov-orders", getGovOrders)
		api.GET("/gov-orders/:id", getGovOrder)
		api.GET("/gallery", getGallery)
		api.GET("/results", getResults)
		api.GET("/student-summary", getStudentSummary)
		api.GET("/classes", getPublicClasses)
		api.GET("/groups", getPublicGroups)
		api.POST("/feedback", submitFeedback)
	}

	// ==================== ADMIN API ROUTES ====================
	adminAPI := r.Group("/api/v1/admin")
	adminAPI.POST("/login", adminLogin)

	adminAPIAuth := r.Group("/api/v1/admin")
	adminAPIAuth.Use(middleware.APIAuthMiddleware())
	{
		adminAPIAuth.GET("/dashboard", adminDashboard)
		adminAPIAuth.POST("/upload", uploadFile)
		adminAPIAuth.PUT("/college-info", adminUpdateCollegeInfo)

		// Teachers
		adminAPIAuth.GET("/teachers", adminGetTeachers)
		adminAPIAuth.POST("/teachers", adminCreateTeacher)
		adminAPIAuth.PUT("/teachers/:id", adminUpdateTeacher)
		adminAPIAuth.DELETE("/teachers/:id", adminDeleteTeacher)

		// Staff
		adminAPIAuth.GET("/staff", adminGetStaff)
		adminAPIAuth.POST("/staff", adminCreateStaff)
		adminAPIAuth.PUT("/staff/:id", adminUpdateStaff)
		adminAPIAuth.DELETE("/staff/:id", adminDeleteStaff)

		// Notices
		adminAPIAuth.GET("/notices", adminGetNotices)
		adminAPIAuth.POST("/notices", adminCreateNotice)
		adminAPIAuth.PUT("/notices/:id", adminUpdateNotice)
		adminAPIAuth.DELETE("/notices/:id", adminDeleteNotice)

		// Gov Orders
		adminAPIAuth.GET("/gov-orders", adminGetGovOrders)
		adminAPIAuth.POST("/gov-orders", adminCreateGovOrder)
		adminAPIAuth.PUT("/gov-orders/:id", adminUpdateGovOrder)
		adminAPIAuth.DELETE("/gov-orders/:id", adminDeleteGovOrder)

		// Gallery
		adminAPIAuth.GET("/gallery", adminGetGallery)
		adminAPIAuth.POST("/gallery", adminCreateGallery)
		adminAPIAuth.DELETE("/gallery/:id", adminDeleteGallery)

		// Results
		adminAPIAuth.GET("/results", adminGetResults)
		adminAPIAuth.POST("/results", adminCreateResult)
		adminAPIAuth.PUT("/results/:id", adminUpdateResult)
		adminAPIAuth.DELETE("/results/:id", adminDeleteResult)

		// Classes
		adminAPIAuth.GET("/classes", adminGetClasses)
		adminAPIAuth.POST("/classes", adminCreateClass)
		adminAPIAuth.PUT("/classes/:id", adminUpdateClass)
		adminAPIAuth.DELETE("/classes/:id", adminDeleteClass)

		// Groups
		adminAPIAuth.GET("/groups", adminGetGroups)
		adminAPIAuth.POST("/groups", adminCreateGroup)
		adminAPIAuth.PUT("/groups/:id", adminUpdateGroup)
		adminAPIAuth.DELETE("/groups/:id", adminDeleteGroup)

		// Student Summary
		adminAPIAuth.GET("/student-summary", adminGetStudentSummaries)
		adminAPIAuth.POST("/student-summary", adminCreateStudentSummary)
		adminAPIAuth.PUT("/student-summary/:id", adminUpdateStudentSummary)
		adminAPIAuth.DELETE("/student-summary/:id", adminDeleteStudentSummary)

		// Feedback
		adminAPIAuth.GET("/feedback", adminGetFeedbacks)
		adminAPIAuth.PUT("/feedback/:id/read", adminMarkFeedbackRead)
		adminAPIAuth.DELETE("/feedback/:id", adminDeleteFeedback)
	}

	// ==================== ADMIN WEB PANEL ROUTES ====================
	adminWeb := r.Group("/admin")
	{
		adminWeb.GET("/login", adminWebLogin)
		adminWeb.POST("/login", adminWebDoLogin)
	}

	adminWebAuth := r.Group("/admin")
	adminWebAuth.Use(middleware.SessionAuthMiddleware())
	{
		adminWebAuth.GET("", adminWebDashboard)
		adminWebAuth.GET("/dashboard", adminWebDashboard)
		adminWebAuth.GET("/logout", adminWebLogout)

		adminWebAuth.GET("/teachers", adminWebTeachers)
		adminWebAuth.POST("/teachers", adminWebCreateTeacher)
		adminWebAuth.POST("/teachers/:id/update", adminWebUpdateTeacher)
		adminWebAuth.POST("/teachers/:id/delete", adminWebDeleteTeacher)

		adminWebAuth.GET("/staff", adminWebStaff)
		adminWebAuth.POST("/staff", adminWebCreateStaff)
		adminWebAuth.POST("/staff/:id/update", adminWebUpdateStaff)
		adminWebAuth.POST("/staff/:id/delete", adminWebDeleteStaff)

		adminWebAuth.GET("/notices", adminWebNotices)
		adminWebAuth.POST("/notices", adminWebCreateNotice)
		adminWebAuth.POST("/notices/:id/update", adminWebUpdateNotice)
		adminWebAuth.POST("/notices/:id/delete", adminWebDeleteNotice)

		adminWebAuth.GET("/gov-orders", adminWebGovOrders)
		adminWebAuth.POST("/gov-orders", adminWebCreateGovOrder)
		adminWebAuth.POST("/gov-orders/:id/update", adminWebUpdateGovOrder)
		adminWebAuth.POST("/gov-orders/:id/delete", adminWebDeleteGovOrder)

		adminWebAuth.GET("/gallery", adminWebGallery)
		adminWebAuth.POST("/gallery", adminWebCreateGallery)
		adminWebAuth.POST("/gallery/:id/update", adminWebUpdateGallery)
		adminWebAuth.POST("/gallery/:id/delete", adminWebDeleteGallery)

		adminWebAuth.GET("/results", adminWebResults)
		adminWebAuth.POST("/results", adminWebCreateResult)
		adminWebAuth.POST("/results/:id/update", adminWebUpdateResult)
		adminWebAuth.POST("/results/:id/delete", adminWebDeleteResult)

		adminWebAuth.GET("/classes", adminWebClasses)
		adminWebAuth.POST("/classes", adminWebCreateClass)
		adminWebAuth.POST("/classes/:id/update", adminWebUpdateClass)
		adminWebAuth.POST("/classes/:id/delete", adminWebDeleteClass)

		adminWebAuth.GET("/groups", adminWebGroups)
		adminWebAuth.POST("/groups", adminWebCreateGroup)
		adminWebAuth.POST("/groups/:id/update", adminWebUpdateGroup)
		adminWebAuth.POST("/groups/:id/delete", adminWebDeleteGroup)

		adminWebAuth.GET("/student-summary", adminWebStudentSummary)
		adminWebAuth.POST("/student-summary", adminWebCreateStudentSummary)
		adminWebAuth.POST("/student-summary/:id/update", adminWebUpdateStudentSummary)
		adminWebAuth.POST("/student-summary/:id/delete", adminWebDeleteStudentSummary)

		adminWebAuth.GET("/feedback", adminWebFeedback)
		adminWebAuth.POST("/feedback/:id/read", adminWebMarkFeedbackRead)

		adminWebAuth.GET("/settings", adminWebSettings)
		adminWebAuth.POST("/settings", adminWebUpdateSettings)

		adminWebAuth.POST("/upload", adminWebUpload)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)
	log.Printf("🔧 Admin panel: http://localhost:%s/admin", port)
	r.Run(":" + port)
}

// ========== Seed Admin ==========
func seedAdmin() {
	var count int64
	database.DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		database.DB.Create(&models.Admin{
			Username:     "admin",
			PasswordHash: string(hash),
			FullName:     "System Admin",
			Email:        "admin@satbariacollege.edu.bd",
			IsActive:     true,
		})
		log.Println("✅ Default admin created: admin/admin123")
	}
}

// ========== PUBLIC API HANDLERS ==========

func getCollegeInfo(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	c.JSON(http.StatusOK, gin.H{"data": info})
}

func getTeachers(c *gin.Context) {
	var teachers []models.Teacher
	database.DB.Where("is_active = ?", true).Order("sort_order asc, id asc").Find(&teachers)
	c.JSON(http.StatusOK, gin.H{"data": teachers})
}

func getStaff(c *gin.Context) {
	var staff []models.Staff
	database.DB.Where("is_active = ?", true).Order("sort_order asc, id asc").Find(&staff)
	c.JSON(http.StatusOK, gin.H{"data": staff})
}

func getNotices(c *gin.Context) {
	var notices []models.Notice
	database.DB.Where("is_active = ?", true).
		Order("is_pinned desc, publish_date desc").Find(&notices)
	c.JSON(http.StatusOK, gin.H{"data": notices})
}

func getNotice(c *gin.Context) {
	id := c.Param("id")
	var notice models.Notice
	if err := database.DB.Where("id = ? AND is_active = ?", id, true).First(&notice).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": notice})
}

func getGovOrders(c *gin.Context) {
	var orders []models.GovOrder
	database.DB.Where("is_active = ?", true).
		Order("is_pinned desc, order_date desc, publish_date desc").Find(&orders)
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func getGovOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.GovOrder
	if err := database.DB.Where("id = ? AND is_active = ?", id, true).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gov order not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": order})
}

func getGallery(c *gin.Context) {
	var images []models.GalleryImage
	query := database.DB.Where("is_active = ?", true).Order("sort_order asc, id desc")
	if cat := c.Query("category"); cat != "" {
		query = query.Where("category = ?", cat)
	}
	query.Find(&images)
	c.JSON(http.StatusOK, gin.H{"data": images})
}

func getResults(c *gin.Context) {
	var results []models.Result
	query := database.DB.Where("is_active = ?", true).Order("id desc")
	if class := c.Query("class"); class != "" {
		query = query.Where("class = ?", class)
	}
	if group := c.Query("group"); group != "" {
		query = query.Where("`group` = ?", group)
	}
	if session := c.Query("session"); session != "" {
		query = query.Where("session = ?", session)
	}
	query.Find(&results)
	c.JSON(http.StatusOK, gin.H{"data": results})
}

func getStudentSummary(c *gin.Context) {
	var summaries []models.StudentSummary
	query := database.DB.Preload("Class").Preload("Group").Order("session desc, class_id asc")
	if s := c.Query("session"); s != "" {
		query = query.Where("session = ?", s)
	}
	if classID := c.Query("class_id"); classID != "" {
		query = query.Where("class_id = ?", classID)
	}
	query.Find(&summaries)
	c.JSON(http.StatusOK, gin.H{"data": summaries})
}

func getPublicClasses(c *gin.Context) {
	var items []models.Class
	database.DB.Where("is_active = ?", true).Order("id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func getPublicGroups(c *gin.Context) {
	var items []models.Group
	database.DB.Preload("Class").Where("is_active = ?", true).Order("id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func submitFeedback(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email"`
		Mobile  string `json:"mobile"`
		Subject string `json:"subject"`
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	feedback := models.Feedback{
		Name:      input.Name,
		Email:     input.Email,
		Mobile:    input.Mobile,
		Subject:   input.Subject,
		Message:   input.Message,
		IPAddress: c.ClientIP(),
	}
	database.DB.Create(&feedback)
	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully!"})
}

// ========== ADMIN API HANDLERS ==========

func adminLogin(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var admin models.Admin
	if err := database.DB.Where("username = ? AND is_active = ?", input.Username, true).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token, _ := middleware.GenerateToken(admin.ID, admin.Username)
	now := time.Now()
	database.DB.Model(&admin).Update("last_login", &now)
	c.JSON(http.StatusOK, gin.H{"token": token, "username": admin.Username})
}

func adminDashboard(c *gin.Context) {
	var teacherCount, staffCount, noticeCount, galleryCount, feedbackCount, unread int64
	database.DB.Model(&models.Teacher{}).Where("is_active = ?", true).Count(&teacherCount)
	database.DB.Model(&models.Staff{}).Where("is_active = ?", true).Count(&staffCount)
	database.DB.Model(&models.Notice{}).Where("is_active = ?", true).Count(&noticeCount)
	database.DB.Model(&models.GalleryImage{}).Where("is_active = ?", true).Count(&galleryCount)
	database.DB.Model(&models.Feedback{}).Count(&feedbackCount)
	database.DB.Model(&models.Feedback{}).Where("is_read = ?", false).Count(&unread)

	c.JSON(http.StatusOK, gin.H{
		"teachers": teacherCount, "staff": staffCount,
		"notices": noticeCount, "gallery": galleryCount,
		"feedbacks": feedbackCount, "unread_feedback": unread,
	})
}

func uploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	if err := c.SaveUploadedFile(file, "./uploads/"+filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": "/uploads/" + filename})
}

func adminUpdateCollegeInfo(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	c.ShouldBindJSON(&info)
	database.DB.Save(&info)
	c.JSON(http.StatusOK, gin.H{"data": info})
}

// Teachers
func adminGetTeachers(c *gin.Context) {
	var items []models.Teacher
	database.DB.Order("sort_order asc, id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateTeacher(c *gin.Context) {
	var item models.Teacher
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateTeacher(c *gin.Context) {
	var item models.Teacher
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteTeacher(c *gin.Context) {
	database.DB.Delete(&models.Teacher{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Staff
func adminGetStaff(c *gin.Context) {
	var items []models.Staff
	database.DB.Order("sort_order asc, id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateStaff(c *gin.Context) {
	var item models.Staff
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateStaff(c *gin.Context) {
	var item models.Staff
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteStaff(c *gin.Context) {
	database.DB.Delete(&models.Staff{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Notices
func adminGetNotices(c *gin.Context) {
	var items []models.Notice
	database.DB.Order("is_pinned desc, publish_date desc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateNotice(c *gin.Context) {
	var item models.Notice
	c.ShouldBindJSON(&item)
	if item.PublishDate.IsZero() {
		item.PublishDate = time.Now()
	}
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateNotice(c *gin.Context) {
	var item models.Notice
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteNotice(c *gin.Context) {
	database.DB.Delete(&models.Notice{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Gov Orders
func adminGetGovOrders(c *gin.Context) {
	var items []models.GovOrder
	database.DB.Order("is_pinned desc, order_date desc, publish_date desc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateGovOrder(c *gin.Context) {
	var item models.GovOrder
	c.ShouldBindJSON(&item)
	if item.PublishDate.IsZero() {
		item.PublishDate = time.Now()
	}
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateGovOrder(c *gin.Context) {
	var item models.GovOrder
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteGovOrder(c *gin.Context) {
	database.DB.Delete(&models.GovOrder{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Gallery
func adminGetGallery(c *gin.Context) {
	var items []models.GalleryImage
	database.DB.Order("sort_order asc, id desc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateGallery(c *gin.Context) {
	var item models.GalleryImage
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminDeleteGallery(c *gin.Context) {
	database.DB.Delete(&models.GalleryImage{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Results
func adminGetResults(c *gin.Context) {
	var items []models.Result
	database.DB.Order("id desc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateResult(c *gin.Context) {
	var item models.Result
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateResult(c *gin.Context) {
	var item models.Result
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteResult(c *gin.Context) {
	database.DB.Delete(&models.Result{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Student Summary
func adminGetStudentSummaries(c *gin.Context) {
	var items []models.StudentSummary
	database.DB.Preload("Class").Preload("Group").Order("session desc, class_id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateStudentSummary(c *gin.Context) {
	var item models.StudentSummary
	c.ShouldBindJSON(&item)
	item.Total = item.TotalMale + item.TotalFemale
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateStudentSummary(c *gin.Context) {
	var item models.StudentSummary
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	item.Total = item.TotalMale + item.TotalFemale
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteStudentSummary(c *gin.Context) {
	database.DB.Delete(&models.StudentSummary{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Classes
func adminGetClasses(c *gin.Context) {
	var items []models.Class
	database.DB.Order("id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateClass(c *gin.Context) {
	var item models.Class
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateClass(c *gin.Context) {
	var item models.Class
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteClass(c *gin.Context) {
	database.DB.Delete(&models.Class{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Groups
func adminGetGroups(c *gin.Context) {
	var items []models.Group
	database.DB.Preload("Class").Order("id asc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminCreateGroup(c *gin.Context) {
	var item models.Group
	c.ShouldBindJSON(&item)
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"data": item})
}
func adminUpdateGroup(c *gin.Context) {
	var item models.Group
	database.DB.First(&item, c.Param("id"))
	c.ShouldBindJSON(&item)
	database.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"data": item})
}
func adminDeleteGroup(c *gin.Context) {
	database.DB.Delete(&models.Group{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Feedback
func adminGetFeedbacks(c *gin.Context) {
	var items []models.Feedback
	database.DB.Order("created_at desc").Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}
func adminMarkFeedbackRead(c *gin.Context) {
	database.DB.Model(&models.Feedback{}).Where("id = ?", c.Param("id")).Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}
func adminDeleteFeedback(c *gin.Context) {
	database.DB.Delete(&models.Feedback{}, c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ========== ADMIN WEB PANEL HANDLERS ==========

type PageData struct {
	Title    string
	Username string
	Data     interface{}
	Error    string
	Success  string
}

func adminWebLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", gin.H{"title": "Admin Login"})
}

func adminWebDoLogin(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")

	var admin models.Admin
	if err := database.DB.Where("username = ? AND is_active = ?", username, true).First(&admin).Error; err != nil {
		c.HTML(http.StatusOK, "login.html", gin.H{"error": "Invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		c.HTML(http.StatusOK, "login.html", gin.H{"error": "Invalid credentials"})
		return
	}

	token, _ := middleware.GenerateToken(admin.ID, admin.Username)
	c.SetCookie("admin_token", token, 86400, "/", "", false, true)
	now := time.Now()
	database.DB.Model(&admin).Update("last_login", &now)
	c.Redirect(http.StatusFound, "/admin/dashboard")
}

func adminWebLogout(c *gin.Context) {
	c.SetCookie("admin_token", "", -1, "/", "", false, true)
	c.Redirect(http.StatusFound, "/admin/login")
}

func adminWebDashboard(c *gin.Context) {
	var teacherCount, staffCount, noticeCount, galleryCount, feedbackCount, unread int64
	database.DB.Model(&models.Teacher{}).Where("is_active = ?", true).Count(&teacherCount)
	database.DB.Model(&models.Staff{}).Where("is_active = ?", true).Count(&staffCount)
	database.DB.Model(&models.Notice{}).Where("is_active = ?", true).Count(&noticeCount)
	database.DB.Model(&models.GalleryImage{}).Where("is_active = ?", true).Count(&galleryCount)
	database.DB.Model(&models.Feedback{}).Count(&feedbackCount)
	database.DB.Model(&models.Feedback{}).Where("is_read = ?", false).Count(&unread)

	var recentNotices []models.Notice
	database.DB.Order("created_at desc").Limit(5).Find(&recentNotices)
	var recentFeedback []models.Feedback
	database.DB.Order("created_at desc").Limit(5).Find(&recentFeedback)

	c.HTML(http.StatusOK, "dashboard.html", gin.H{
		"title":          "Dashboard",
		"username":       c.GetString("username"),
		"teacherCount":   teacherCount,
		"staffCount":     staffCount,
		"noticeCount":    noticeCount,
		"galleryCount":   galleryCount,
		"feedbackCount":  feedbackCount,
		"unreadFeedback": unread,
		"recentNotices":  recentNotices,
		"recentFeedback": recentFeedback,
	})
}

func adminWebTeachers(c *gin.Context) {
	var items []models.Teacher
	database.DB.Order("sort_order asc, id asc").Find(&items)
	c.HTML(http.StatusOK, "teachers.html", gin.H{
		"title": "Teachers", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateTeacher(c *gin.Context) {
	item := models.Teacher{
		Name:        c.PostForm("name"),
		Designation: c.PostForm("designation"),
		Subject:     c.PostForm("subject"),
		JoinedDate:  c.PostForm("joined_date"),
		RetiredDate: c.PostForm("retired_date"),
		Picture:     saveUploadedFile(c, "picture"),
		SortOrder:   0,
		IsActive:    c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/teachers")
}

func adminWebUpdateTeacher(c *gin.Context) {
	var item models.Teacher
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/teachers")
		return
	}
	item.Name = c.PostForm("name")
	item.Designation = c.PostForm("designation")
	item.Subject = c.PostForm("subject")
	item.JoinedDate = c.PostForm("joined_date")
	item.RetiredDate = c.PostForm("retired_date")
	item.IsActive = c.PostForm("is_active") == "on"

	if newPic := saveUploadedFile(c, "picture"); newPic != "" {
		item.Picture = newPic
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/teachers")
}

func adminWebDeleteTeacher(c *gin.Context) {
	database.DB.Delete(&models.Teacher{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/teachers")
}

func adminWebStaff(c *gin.Context) {
	var items []models.Staff
	database.DB.Order("sort_order asc, id asc").Find(&items)
	c.HTML(http.StatusOK, "staff.html", gin.H{
		"title": "Staff", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateStaff(c *gin.Context) {
	item := models.Staff{
		Name:        c.PostForm("name"),
		Designation: c.PostForm("designation"),
		Department:  c.PostForm("department"),
		JoinedDate:  c.PostForm("joined_date"),
		Picture:     saveUploadedFile(c, "picture"),
		SortOrder:   0,
		IsActive:    c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/staff")
}

func adminWebUpdateStaff(c *gin.Context) {
	var item models.Staff
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/staff")
		return
	}
	item.Name = c.PostForm("name")
	item.Designation = c.PostForm("designation")
	item.Department = c.PostForm("department")
	item.JoinedDate = c.PostForm("joined_date")
	item.IsActive = c.PostForm("is_active") == "on"

	if newPic := saveUploadedFile(c, "picture"); newPic != "" {
		item.Picture = newPic
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/staff")
}

func adminWebDeleteStaff(c *gin.Context) {
	database.DB.Delete(&models.Staff{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/staff")
}

func adminWebNotices(c *gin.Context) {
	var items []models.Notice
	database.DB.Order("is_pinned desc, publish_date desc").Find(&items)
	c.HTML(http.StatusOK, "notices.html", gin.H{
		"title": "Notices", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateNotice(c *gin.Context) {
	attachment, attachmentName := saveUploadedFileWithName(c, "attachment")
	item := models.Notice{
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		Image:          saveUploadedFile(c, "image"),
		Attachment:     attachment,
		AttachmentName: attachmentName,
		PublishDate:    parseFormDate(c.PostForm("publish_date")),
		IsActive:       c.PostForm("is_active") == "on",
		IsPinned:       c.PostForm("is_pinned") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/notices")
}

func adminWebUpdateNotice(c *gin.Context) {
	var item models.Notice
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/notices")
		return
	}
	item.Title = c.PostForm("title")
	item.Content = c.PostForm("content")
	item.IsActive = c.PostForm("is_active") == "on"
	item.IsPinned = c.PostForm("is_pinned") == "on"
	if d := c.PostForm("publish_date"); d != "" {
		item.PublishDate = parseFormDate(d)
	}

	if newImg := saveUploadedFile(c, "image"); newImg != "" {
		item.Image = newImg
	}
	if newFile, newName := saveUploadedFileWithName(c, "attachment"); newFile != "" {
		item.Attachment = newFile
		item.AttachmentName = newName
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/notices")
}

func adminWebDeleteNotice(c *gin.Context) {
	database.DB.Delete(&models.Notice{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/notices")
}

// Gov Orders (web panel)
func adminWebGovOrders(c *gin.Context) {
	var items []models.GovOrder
	database.DB.Order("is_pinned desc, order_date desc, publish_date desc").Find(&items)
	c.HTML(http.StatusOK, "gov_orders.html", gin.H{
		"title": "Gov Orders", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateGovOrder(c *gin.Context) {
	attachment, attachmentName := saveUploadedFileWithName(c, "attachment")
	item := models.GovOrder{
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		OrderNumber:    c.PostForm("order_number"),
		Attachment:     attachment,
		AttachmentName: attachmentName,
		OrderDate:      parseFormDate(c.PostForm("order_date")),
		PublishDate:    parseFormDate(c.PostForm("publish_date")),
		IsActive:       c.PostForm("is_active") == "on",
		IsPinned:       c.PostForm("is_pinned") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/gov-orders")
}

func adminWebUpdateGovOrder(c *gin.Context) {
	var item models.GovOrder
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/gov-orders")
		return
	}
	item.Title = c.PostForm("title")
	item.Content = c.PostForm("content")
	item.OrderNumber = c.PostForm("order_number")
	item.IsActive = c.PostForm("is_active") == "on"
	item.IsPinned = c.PostForm("is_pinned") == "on"
	if d := c.PostForm("order_date"); d != "" {
		item.OrderDate = parseFormDate(d)
	}
	if d := c.PostForm("publish_date"); d != "" {
		item.PublishDate = parseFormDate(d)
	}

	if newFile, newName := saveUploadedFileWithName(c, "attachment"); newFile != "" {
		item.Attachment = newFile
		item.AttachmentName = newName
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/gov-orders")
}

func adminWebDeleteGovOrder(c *gin.Context) {
	database.DB.Delete(&models.GovOrder{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/gov-orders")
}

func adminWebGallery(c *gin.Context) {
	var items []models.GalleryImage
	database.DB.Order("sort_order asc, id desc").Find(&items)
	c.HTML(http.StatusOK, "gallery.html", gin.H{
		"title": "Gallery", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateGallery(c *gin.Context) {
	item := models.GalleryImage{
		Title:     c.PostForm("title"),
		ImagePath: saveUploadedFile(c, "image"),
		Category:  c.PostForm("category"),
		IsActive:  c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/gallery")
}

func adminWebUpdateGallery(c *gin.Context) {
	var item models.GalleryImage
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/gallery")
		return
	}
	item.Title = c.PostForm("title")
	item.Category = c.PostForm("category")
	item.IsActive = c.PostForm("is_active") == "on"

	if newPath := saveUploadedFile(c, "image"); newPath != "" {
		item.ImagePath = newPath
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/gallery")
}

func adminWebDeleteGallery(c *gin.Context) {
	database.DB.Delete(&models.GalleryImage{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/gallery")
}

func adminWebResults(c *gin.Context) {
	var items []models.Result
	database.DB.Order("id desc").Find(&items)
	c.HTML(http.StatusOK, "results.html", gin.H{
		"title": "Results", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateResult(c *gin.Context) {
	item := models.Result{
		Title:    c.PostForm("title"),
		Session:  c.PostForm("session"),
		Class:    c.PostForm("class"),
		Group:    c.PostForm("group"),
		ExamYear: c.PostForm("exam_year"),
		FilePath: saveUploadedFile(c, "file"),
		IsActive: c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/results")
}

func adminWebUpdateResult(c *gin.Context) {
	var item models.Result
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/results")
		return
	}
	item.Title = c.PostForm("title")
	item.Session = c.PostForm("session")
	item.Class = c.PostForm("class")
	item.Group = c.PostForm("group")
	item.ExamYear = c.PostForm("exam_year")
	item.IsActive = c.PostForm("is_active") == "on"

	if newFile := saveUploadedFile(c, "file"); newFile != "" {
		item.FilePath = newFile
	}

	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/results")
}

func adminWebDeleteResult(c *gin.Context) {
	database.DB.Delete(&models.Result{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/results")
}

func adminWebStudentSummary(c *gin.Context) {
	var items []models.StudentSummary
	database.DB.Preload("Class").Preload("Group").Order("session desc, class_id asc").Find(&items)
	
	var classes []models.Class
	database.DB.Find(&classes)
	
	var groups []models.Group
	database.DB.Find(&groups)
	
	c.HTML(http.StatusOK, "student_summary.html", gin.H{
		"title": "Student Summary", "username": c.GetString("username"), "items": items,
		"classes": classes, "groups": groups,
	})
}

func adminWebCreateStudentSummary(c *gin.Context) {
	male, _ := strconvAtoi(c.PostForm("total_male"))
	female, _ := strconvAtoi(c.PostForm("total_female"))
	classID, _ := strconvAtoi(c.PostForm("class_id"))
	groupID, _ := strconvAtoi(c.PostForm("group_id"))
	item := models.StudentSummary{
		Session:     c.PostForm("session"),
		ClassID:     uint(classID),
		GroupID:     uint(groupID),
		TotalMale:   male,
		TotalFemale: female,
		Total:       male + female,
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/student-summary")
}

func adminWebUpdateStudentSummary(c *gin.Context) {
	var item models.StudentSummary
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/student-summary")
		return
	}
	male, _ := strconvAtoi(c.PostForm("total_male"))
	female, _ := strconvAtoi(c.PostForm("total_female"))
	classID, _ := strconvAtoi(c.PostForm("class_id"))
	groupID, _ := strconvAtoi(c.PostForm("group_id"))
	
	item.Session = c.PostForm("session")
	item.ClassID = uint(classID)
	item.GroupID = uint(groupID)
	item.TotalMale = male
	item.TotalFemale = female
	item.Total = male + female
	
	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/student-summary")
}

func adminWebDeleteStudentSummary(c *gin.Context) {
	database.DB.Delete(&models.StudentSummary{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/student-summary")
}

func adminWebClasses(c *gin.Context) {
	var items []models.Class
	database.DB.Order("id asc").Find(&items)
	c.HTML(http.StatusOK, "class.html", gin.H{
		"title": "Classes", "username": c.GetString("username"), "items": items,
	})
}

func adminWebCreateClass(c *gin.Context) {
	item := models.Class{
		Name:     c.PostForm("name"),
		IsActive: c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/classes")
}

func adminWebUpdateClass(c *gin.Context) {
	var item models.Class
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/classes")
		return
	}
	item.Name = c.PostForm("name")
	item.IsActive = c.PostForm("is_active") == "on"
	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/classes")
}

func adminWebDeleteClass(c *gin.Context) {
	database.DB.Delete(&models.Class{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/classes")
}

func adminWebGroups(c *gin.Context) {
	var items []models.Group
	database.DB.Preload("Class").Order("id asc").Find(&items)
	
	var classes []models.Class
	database.DB.Find(&classes)
	
	c.HTML(http.StatusOK, "group.html", gin.H{
		"title": "Groups", "username": c.GetString("username"), "items": items, "classes": classes,
	})
}

func adminWebCreateGroup(c *gin.Context) {
	classID, _ := strconvAtoi(c.PostForm("class_id"))
	item := models.Group{
		Name:     c.PostForm("name"),
		ClassID:  uint(classID),
		IsActive: c.PostForm("is_active") == "on",
	}
	database.DB.Create(&item)
	c.Redirect(http.StatusFound, "/admin/groups")
}

func adminWebUpdateGroup(c *gin.Context) {
	var item models.Group
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.Redirect(http.StatusFound, "/admin/groups")
		return
	}
	classID, _ := strconvAtoi(c.PostForm("class_id"))
	item.Name = c.PostForm("name")
	item.ClassID = uint(classID)
	item.IsActive = c.PostForm("is_active") == "on"
	database.DB.Save(&item)
	c.Redirect(http.StatusFound, "/admin/groups")
}

func adminWebDeleteGroup(c *gin.Context) {
	database.DB.Delete(&models.Group{}, c.Param("id"))
	c.Redirect(http.StatusFound, "/admin/groups")
}

func adminWebFeedback(c *gin.Context) {
	var items []models.Feedback
	database.DB.Order("created_at desc").Find(&items)
	c.HTML(http.StatusOK, "feedback.html", gin.H{
		"title": "Feedback & Messages", "username": c.GetString("username"), "items": items,
	})
}

func adminWebMarkFeedbackRead(c *gin.Context) {
	database.DB.Model(&models.Feedback{}).Where("id = ?", c.Param("id")).Update("is_read", true)
	c.Redirect(http.StatusFound, "/admin/feedback")
}

func adminWebSettings(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	c.HTML(http.StatusOK, "settings.html", gin.H{
		"title": "Settings", "username": c.GetString("username"), "info": info,
	})
}

func adminWebUpdateSettings(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	info.Name = c.PostForm("name")
	info.EstYear = c.PostForm("est_year")
	info.EIIN = c.PostForm("eiin")
	info.Address = c.PostForm("address")
	info.Mobile = c.PostForm("mobile")
	info.Email = c.PostForm("email")
	info.About = c.PostForm("about")
	info.History = c.PostForm("history")
	info.MapEmbedURL = c.PostForm("map_embed_url")
	database.DB.Save(&info)
	c.Redirect(http.StatusFound, "/admin/settings?success=1")
}

func adminWebUpload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file"})
		return
	}
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	c.SaveUploadedFile(file, "./uploads/"+filename)
	c.JSON(http.StatusOK, gin.H{"url": "/uploads/" + filename})
}

func strconvAtoi(s string) (int, error) {
	if s == "" {
		return 0, nil
	}
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}

// downloadFile serves a file from the uploads directory with a
// Content-Disposition: attachment header so the browser downloads it.
// Query: ?file=/uploads/<name>  (optional &name=<friendly filename>)
func downloadFile(c *gin.Context) {
	file := c.Query("file")
	// Only allow files under /uploads to avoid path traversal.
	cleaned := filepath.Clean(strings.TrimPrefix(file, "/uploads/"))
	if file == "" || !strings.HasPrefix(file, "/uploads/") || strings.Contains(cleaned, "..") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file"})
		return
	}
	fullPath := filepath.Join("./uploads", cleaned)
	if _, err := os.Stat(fullPath); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}
	name := c.Query("name")
	if name == "" {
		name = filepath.Base(cleaned)
	}
	c.FileAttachment(fullPath, name)
}

func saveUploadedFile(c *gin.Context, fieldName string) string {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return ""
	}
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	c.SaveUploadedFile(file, "./uploads/"+filename)
	return "/uploads/" + filename
}

// saveUploadedFileWithName stores the file and returns both its served path and
// the original filename (useful for showing a friendly download label).
func saveUploadedFileWithName(c *gin.Context, fieldName string) (string, string) {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return "", ""
	}
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	c.SaveUploadedFile(file, "./uploads/"+filename)
	return "/uploads/" + filename, file.Filename
}

// parseFormDate parses a yyyy-mm-dd date from an HTML date input. Empty or
// invalid input falls back to the current time.
func parseFormDate(s string) time.Time {
	if s == "" {
		return time.Now()
	}
	if t, err := time.Parse("2006-01-02", s); err == nil {
		return t
	}
	return time.Now()
}

// Helper to get DB for deferred use
func getDB() *gorm.DB {
	return database.DB
}
