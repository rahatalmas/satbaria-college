# Satbaria Degree College - Full Stack Web Project

## Project Structure

```
satbaria-college/
├── frontend/          # React frontend (Public College Website)
├── backend/           # Go + GORM + MySQL (API + Admin Panel)
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Public) | React 18, React Router, Tailwind CSS |
| Backend API | Go (Golang), Gin Framework |
| Admin Panel | Go HTML Templates + Tailwind CSS |
| ORM | GORM |
| Database | MySQL |

## Features

### Public Website (React)
- Home — College history, announcements
- Academics — Groups (Science, Business, Humanities), Student Summary
- Result — Download results by year/class
- Notice Board — Notices with images
- Gallery — Photo gallery
- Teachers List — With photo, designation, subject
- Staff List
- Contact Page — Map + contact info
- Feedback / Message form

### Admin Panel (Go + HTML Templates)
- Login / Logout
- Dashboard with stats
- Manage Teachers (CRUD + photo upload)
- Manage Staff (CRUD + photo upload)
- Manage Notices (CRUD + image upload)
- Manage Gallery (CRUD)
- Manage Results (CRUD + file upload)
- Manage Student Summary data
- Manage Feedback/Messages (view)

## Setup Instructions

### Database
```sql
CREATE DATABASE satbaria_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Backend (Go)
```bash
cd backend
cp .env.example .env   # Edit with your DB credentials
go mod tidy
go run cmd/server/main.go
# Server runs on http://localhost:8080
# Admin panel: http://localhost:8080/admin
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## API Base URL
All API endpoints are prefixed with `/api/v1`
# satbaria-college
