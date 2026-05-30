package models

import (
	"time"

	"gorm.io/gorm"
)

// Teacher model
type Teacher struct {
	gorm.Model
	Name        string `gorm:"not null" json:"name"`
	Designation string `json:"designation"`
	Subject     string `json:"subject"`
	JoinedDate  string `json:"joined_date"`
	RetiredDate string `json:"retired_date"`
	Picture     string `json:"picture"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	SortOrder   int    `gorm:"default:0" json:"sort_order"`
}

// Staff model
type Staff struct {
	gorm.Model
	Name        string `gorm:"not null" json:"name"`
	Designation string `json:"designation"`
	Department  string `json:"department"`
	JoinedDate  string `json:"joined_date"`
	Picture     string `json:"picture"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	SortOrder   int    `gorm:"default:0" json:"sort_order"`
}

// Notice model
type Notice struct {
	gorm.Model
	Title       string    `gorm:"not null" json:"title"`
	Content     string    `gorm:"type:text" json:"content"`
	Image       string    `json:"image"`
	PublishDate time.Time `json:"publish_date"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	IsPinned    bool      `gorm:"default:false" json:"is_pinned"`
}

// GalleryImage model
type GalleryImage struct {
	gorm.Model
	Title     string `json:"title"`
	ImagePath string `gorm:"not null" json:"image_path"`
	Category  string `json:"category"`
	SortOrder int    `gorm:"default:0" json:"sort_order"`
	IsActive  bool   `gorm:"default:true" json:"is_active"`
}

// Result model
type Result struct {
	gorm.Model
	Title    string `gorm:"not null" json:"title"`
	Session  string `json:"session"`
	Class    string `json:"class"` // XI or XII
	Group    string `json:"group"` // Science, Business, Humanities
	ExamYear string `json:"exam_year"`
	FilePath string `json:"file_path"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

// Class model
type Class struct {
	gorm.Model
	Name     string  `gorm:"not null;unique" json:"name"`
	IsActive bool    `gorm:"default:true" json:"is_active"`
	Groups   []Group `json:"groups,omitempty"`
}

// Group model
type Group struct {
	gorm.Model
	Name     string `gorm:"not null" json:"name"`
	ClassID  uint   `gorm:"not null" json:"class_id"`
	Class    Class  `json:"class,omitempty"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

// StudentSummary model
type StudentSummary struct {
	gorm.Model
	Session     string `gorm:"not null" json:"session"`
	ClassID     uint   `gorm:"not null" json:"class_id"`
	Class       Class  `json:"class,omitempty"`
	GroupID     uint   `gorm:"not null" json:"group_id"`
	Group       Group  `json:"group,omitempty"`
	TotalMale   int    `json:"total_male"`
	TotalFemale int    `json:"total_female"`
	Total       int    `json:"total"`
}

// Feedback / Message model
type Feedback struct {
	gorm.Model
	Name      string `gorm:"not null" json:"name"`
	Email     string `json:"email"`
	Mobile    string `json:"mobile"`
	Subject   string `json:"subject"`
	Message   string `gorm:"type:text" json:"message"`
	IsRead    bool   `gorm:"default:false" json:"is_read"`
	IPAddress string `json:"ip_address"`
}

// Admin model
type Admin struct {
	gorm.Model
	Username     string     `gorm:"uniqueIndex;not null;type:varchar(100)" json:"username"`
	PasswordHash string     `gorm:"not null;type:varchar(255)" json:"-"`
	FullName     string     `gorm:"type:varchar(200)" json:"full_name"`
	Email        string     `gorm:"type:varchar(200)" json:"email"`
	IsActive     bool       `gorm:"default:true" json:"is_active"`
	LastLogin    *time.Time `json:"last_login"`
}

// CollegeInfo model - singleton settings
type CollegeInfo struct {
	gorm.Model
	Name           string `gorm:"type:varchar(255)" json:"name"`
	EstYear        string `gorm:"type:varchar(10)" json:"est_year"`
	EIIN           string `gorm:"type:varchar(20)" json:"eiin"`
	Address        string `gorm:"type:varchar(500)" json:"address"`
	Mobile         string `gorm:"type:varchar(50)" json:"mobile"`
	Email          string `gorm:"type:varchar(200)" json:"email"`
	MapEmbedURL    string `gorm:"type:text" json:"map_embed_url"`
	About          string `gorm:"type:text" json:"about"`
	History        string `gorm:"type:text" json:"history"`
	LogoPath       string `gorm:"type:varchar(500)" json:"logo_path"`
	HeroBannerPath string `gorm:"type:varchar(500)" json:"hero_banner_path"`
}
