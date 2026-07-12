# 🚀 Taskora - AI-Powered Project Management Platform

![Taskora Banner](https://img.shields.io/badge/Taskora-Project%20Management-6C63FF?style=for-the-badge&logo=trello&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![MERN](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)

> **Taskora** is a full-stack project management platform powered by AI. It helps individuals and teams organize tasks, track progress, and collaborate efficiently with smart suggestions and automation.

---

## ✨ **Features**

### 🤖 **AI-Powered Features**
- **Smart Task Assistant**: Write a description, and AI suggests:
  - Task title
  - Priority level (Low/Medium/High/Urgent)
  - Estimated days
  - Subtasks breakdown
  - Task summary
- **Auto Priority Detection**: AI analyzes task description to determine priority
- **Smart Subtasks**: Automatically break down large tasks into smaller steps

### 🔐 **Authentication**
- Register / Login with JWT
- Secure password hashing (bcrypt)
- User profile management

### 📊 **Dashboard**
- Real-time statistics (Projects, Tasks, Members)
- Recent projects & tasks overview
- Activity feed
- Dark/Light mode toggle
- Interactive charts (coming soon)

### 📋 **Projects**
- Create, read, update, delete projects
- Add/remove team members
- Project status (Active, Completed, Archived)
- Project members with roles (Manager, Member)

### ✅ **Task Management**
- Full CRUD operations
- Assign tasks to team members
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (To Do, In Progress, Review, Done)
- Due dates & deadlines
- AI-powered task suggestions

### 📋 **Kanban Board**
- Drag & drop between columns
- Visual task management
- Filter by project
- Real-time status updates

### 💬 **Comments & Collaboration**
- Add comments to tasks
- Activity history log
- Team collaboration features

### 🔔 **Notifications**
- Task assignments
- Status changes
- Comment notifications
- Deadline reminders

### 🌙 **Dark Mode**
- Seamless dark/light theme toggle
- Persistent user preference

---

## 🛠️ **Tech Stack**

### **Frontend**
- HTML5, CSS3, JavaScript (Vanilla JS)
- Font Awesome Icons
- Google Fonts (Inter)

### **Backend**
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose ODM
- OpenAI API (optional - can use Mock Data)

### **Authentication**
- JSON Web Tokens (JWT)
- Bcrypt.js (password hashing)

### **AI Integration**
- OpenAI API (GPT-3.5-turbo)
- Mock Data mode (no API key required)

### **Tools**
- Nodemon (development)
- Morgan (logging)
- CORS
- Dotenv (environment variables)

---

## 📁 **Project Structure**
taskora/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ │ └── db.js
│ │ ├── controllers/
│ │ │ ├── authController.js
│ │ │ ├── projectController.js
│ │ │ ├── taskController.js
│ │ │ └── aiController.js
│ │ ├── middleware/
│ │ │ ├── auth.js
│ │ │ └── errorHandler.js
│ │ ├── models/
│ │ │ ├── User.js
│ │ │ ├── Project.js
│ │ │ ├── Task.js
│ │ │ ├── Comment.js
│ │ │ ├── Activity.js
│ │ │ ├── Notification.js
│ │ │ └── Invitation.js
│ │ ├── routes/
│ │ │ ├── authRoutes.js
│ │ │ ├── projectRoutes.js
│ │ │ ├── taskRoutes.js
│ │ │ └── aiRoutes.js
│ │ └── services/
│ │ └── openaiService.js
│ ├── .env
│ ├── seed.js
│ ├── server.js
│ └── package.json
└── frontend/
├── css/
│ └── style.css
├── js/
│ ├── api.js
│ ├── auth.js
│ ├── dashboard.js
│ ├── projects.js
│ ├── kanban.js
│ └── ai.js
├── index.html
├── dashboard.html
├── projects.html
└── kanban.html

---

## 🚀 **Installation**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git
- (Optional) OpenAI API Key for real AI features

### **Step 1: Clone the repository**

```bash
git clone https://github.com/yourusername/taskora.git
cd taskora
🔑 Login Credentials (After Seeding)
Name	Email	Password
Ahmed Mohamed	ahmed@test.com	123456
Sara Ali	sara@test.com	123456
Layan Obeid	layan@test.com	123456
Khalid Hassan	khalid@test.com	123456
🤖 AI Features Guide
Using the AI Task Assistant
Open the Kanban Board page

Click "New Task"

Write a detailed description in the Description field

Click "✨ Suggest with AI"

Review the AI suggestions:

Task title

Priority

Estimated days

Subtasks

Summary

Click "✅ Apply Suggestion" to fill the form automatically

Click "❌ Dismiss" to hide the suggestions

AI Mode Options
Mode	Description	Requirement
Mock Data	AI simulates suggestions locally	No API key needed ✅
OpenAI	Real AI using GPT-3.5-turbo	OpenAI API key required
