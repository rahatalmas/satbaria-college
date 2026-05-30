package handlers

import (
	"net/http"
	"strconv"
	"time"

	"satbaria-college/internal/database"
	"satbaria-college/internal/models"
	"github.com/gin-gonic/gin"
)

// ==================== PUBLIC API HANDLERS ====================

// GetCollegeInfo GET /api/v1/college-info
func GetCollegeInfo(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	c.JSON(http.StatusOK, gin.H{"data": info})
}

// GetTeachers GET /api/v1/teachers
func GetTeachers(c *gin.Context) {
	var teachers []models.Teacher
	database.DB.Where("is_active = ?", true).Order("sort_order asc, created_at asc").Find(&teachers)
	c.JSON(http.StatusOK, gin.H{"data": teachers})
}

// GetStaff GET /api/v1/staff
func GetStaff(c *gin.Context) {
	var staff []models.Staff
	database.DB.Where("is_active = ?", true).Order("sort_order asc, created_at asc").Find(&staff)
	c.JSON(http.StatusOK, gin.H{"data": staff})
}

// GetNotices GET /api/v1/notices
func GetNotices(c *gin.Context) {
	var notices []models.Notice
	database.DB.Where("is_active = ?", true).
		Order("is_pinned desc, publish_date desc").
		Find(&notices)
	c.JSON(http.StatusOK, gin.H{"data": notices})
}

// GetNotice GET /api/v1/notices/:id
func GetNotice(c *gin.Context) {
	id := c.Param("id")
	var notice models.Notice
	if err := database.DB.Where("id = ? AND is_active = ?", id, true).First(&notice).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": notice})
}

// GetGallery GET /api/v1/gallery
func GetGallery(c *gin.Context) {
	var images []models.GalleryImage
	category := c.Query("category")
	query := database.DB.Where("is_active = ?", true).Order("sort_order asc, created_at desc")
	if category != "" {
		query = query.Where("category = ?", category)
	}
	query.Find(&images)
	c.JSON(http.StatusOK, gin.H{"data": images})
}

// GetResults GET /api/v1/results
func GetResults(c *gin.Context) {
	var results []models.Result
	class := c.Query("class")
	group := c.Query("group")
	session := c.Query("session")

	query := database.DB.Where("is_active = ?", true).Order("created_at desc")
	if class != "" {
		query = query.Where("class = ?", class)
	}
	if group != "" {
		query = query.Where("`group` = ?", group)
	}
	if session != "" {
		query = query.Where("session = ?", session)
	}
	query.Find(&results)
	c.JSON(http.StatusOK, gin.H{"data": results})
}

// GetStudentSummary GET /api/v1/student-summary
func GetStudentSummary(c *gin.Context) {
	var summaries []models.StudentSummary
	session := c.Query("session")
	class := c.Query("class")

	query := database.DB.Order("session desc, class asc")
	if session != "" {
		query = query.Where("session = ?", session)
	}
	if class != "" {
		query = query.Where("class = ?", class)
	}
	query.Find(&summaries)
	c.JSON(http.StatusOK, gin.H{"data": summaries})
}

// SubmitFeedback POST /api/v1/feedback
func SubmitFeedback(c *gin.Context) {
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
	c.JSON(http.StatusCreated, gin.H{"message": "Feedback submitted successfully", "data": feedback})
}

// ==================== ADMIN API HANDLERS ====================

// AdminLogin POST /api/v1/admin/login
func AdminLogin(c *gin.Context) {
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

	// In production use bcrypt - simplified for demo
	if admin.PasswordHash != input.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := generateToken(admin.ID, admin.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	now := time.Now()
	database.DB.Model(&admin).Update("last_login", &now)

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": admin.Username,
		"message":  "Login successful",
	})
}

func generateToken(id uint, username string) (string, error) {
	// Using the middleware package function
	import_path := "satbaria-college/internal/middleware"
	_ = import_path
	return "", nil // placeholder - use middleware.GenerateToken in actual impl
}

// ==================== ADMIN CRUD HANDLERS ====================

// Teachers CRUD
func AdminCreateTeacher(c *gin.Context) {
	var teacher models.Teacher
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&teacher)
	c.JSON(http.StatusCreated, gin.H{"data": teacher})
}

func AdminUpdateTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := database.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&teacher)
	c.JSON(http.StatusOK, gin.H{"data": teacher})
}

func AdminDeleteTeacher(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Teacher{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Teacher deleted"})
}

func AdminGetTeachers(c *gin.Context) {
	var teachers []models.Teacher
	database.DB.Order("sort_order asc, created_at asc").Find(&teachers)
	c.JSON(http.StatusOK, gin.H{"data": teachers, "total": len(teachers)})
}

// Notices CRUD
func AdminCreateNotice(c *gin.Context) {
	var notice models.Notice
	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if notice.PublishDate.IsZero() {
		notice.PublishDate = time.Now()
	}
	database.DB.Create(&notice)
	c.JSON(http.StatusCreated, gin.H{"data": notice})
}

func AdminUpdateNotice(c *gin.Context) {
	id := c.Param("id")
	var notice models.Notice
	if err := database.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&notice)
	c.JSON(http.StatusOK, gin.H{"data": notice})
}

func AdminDeleteNotice(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Notice{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Notice deleted"})
}

func AdminGetNotices(c *gin.Context) {
	var notices []models.Notice
	database.DB.Order("is_pinned desc, publish_date desc").Find(&notices)

	var unread int64
	database.DB.Model(&models.Feedback{}).Where("is_read = ?", false).Count(&unread)

	c.JSON(http.StatusOK, gin.H{"data": notices, "total": len(notices)})
}

// Gallery CRUD
func AdminCreateGalleryImage(c *gin.Context) {
	var image models.GalleryImage
	if err := c.ShouldBindJSON(&image); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&image)
	c.JSON(http.StatusCreated, gin.H{"data": image})
}

func AdminDeleteGalleryImage(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.GalleryImage{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}

// Results CRUD
func AdminCreateResult(c *gin.Context) {
	var result models.Result
	if err := c.ShouldBindJSON(&result); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&result)
	c.JSON(http.StatusCreated, gin.H{"data": result})
}

func AdminUpdateResult(c *gin.Context) {
	id := c.Param("id")
	var result models.Result
	if err := database.DB.First(&result, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Result not found"})
		return
	}
	if err := c.ShouldBindJSON(&result); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&result)
	c.JSON(http.StatusOK, gin.H{"data": result})
}

func AdminDeleteResult(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Result{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Result deleted"})
}

// Student Summary CRUD
func AdminCreateStudentSummary(c *gin.Context) {
	var s models.StudentSummary
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.Total = s.TotalMale + s.TotalFemale
	database.DB.Create(&s)
	c.JSON(http.StatusCreated, gin.H{"data": s})
}

func AdminUpdateStudentSummary(c *gin.Context) {
	id := c.Param("id")
	var s models.StudentSummary
	if err := database.DB.First(&s, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.Total = s.TotalMale + s.TotalFemale
	database.DB.Save(&s)
	c.JSON(http.StatusOK, gin.H{"data": s})
}

func AdminDeleteStudentSummary(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.StudentSummary{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Record deleted"})
}

// Feedbacks
func AdminGetFeedbacks(c *gin.Context) {
	var feedbacks []models.Feedback
	database.DB.Order("created_at desc").Find(&feedbacks)
	c.JSON(http.StatusOK, gin.H{"data": feedbacks, "total": len(feedbacks)})
}

func AdminMarkFeedbackRead(c *gin.Context) {
	id := c.Param("id")
	database.DB.Model(&models.Feedback{}).Where("id = ?", id).Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}

// Dashboard stats
func AdminDashboardStats(c *gin.Context) {
	var teacherCount, staffCount, noticeCount, galleryCount, feedbackCount, unreadFeedback int64

	database.DB.Model(&models.Teacher{}).Where("is_active = ?", true).Count(&teacherCount)
	database.DB.Model(&models.Staff{}).Where("is_active = ?", true).Count(&staffCount)
	database.DB.Model(&models.Notice{}).Where("is_active = ?", true).Count(&noticeCount)
	database.DB.Model(&models.GalleryImage{}).Where("is_active = ?", true).Count(&galleryCount)
	database.DB.Model(&models.Feedback{}).Count(&feedbackCount)
	database.DB.Model(&models.Feedback{}).Where("is_read = ?", false).Count(&unreadFeedback)

	var recentNotices []models.Notice
	database.DB.Order("created_at desc").Limit(5).Find(&recentNotices)

	var recentFeedbacks []models.Feedback
	database.DB.Order("created_at desc").Limit(5).Find(&recentFeedbacks)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"teachers":        teacherCount,
			"staff":           staffCount,
			"notices":         noticeCount,
			"gallery":         galleryCount,
			"feedbacks":       feedbackCount,
			"unread_feedback": unreadFeedback,
		},
		"recent_notices":   recentNotices,
		"recent_feedbacks": recentFeedbacks,
	})
}

// Update College Info
func AdminUpdateCollegeInfo(c *gin.Context) {
	var info models.CollegeInfo
	database.DB.First(&info)
	if err := c.ShouldBindJSON(&info); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&info)
	c.JSON(http.StatusOK, gin.H{"data": info})
}

// File Upload Handler
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}

	uploadDir := "./uploads/"
	filename := strconv.FormatInt(time.Now().UnixNano(), 10) + "_" + file.Filename

	if err := c.SaveUploadedFile(file, uploadDir+filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      "/uploads/" + filename,
		"filename": filename,
	})
}
