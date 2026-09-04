# 🎓 Campus Resolv - Campus Complaint & Resolution Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Render-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://complient-management-frontend-i75f.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://complient-managent-backend.onrender.com)

**Campus Resolv** is a full-stack enterprise campus complaint and issue resolution platform built with **Spring Boot 3**, **Spring Security (JWT)**, **PostgreSQL**, and **React 18 (Vite) + Tailwind CSS**. The system stream-lines issue lodging, staff assignments, status lifecycle tracking, file attachments, and activity updates for educational institutions.

---

## 🌐 Live Deployments & Repository

| Service | Deployment / Link | Description |
| :--- | :--- | :--- |
| 🚀 **Frontend App** | [complient-management-frontend-i75f.vercel.app](https://complient-management-frontend-i75f.vercel.app/) | Hosted on Vercel |
| ⚡ **Backend REST API** | [complient-managent-backend.onrender.com](https://complient-managent-backend.onrender.com) | Hosted on Render (Spring Boot) |
| 🐙 **GitHub Repository** | [2310Eswar/Complient_Managent_Backend](https://github.com/2310Eswar/Complient_Managent_Backend.git) | Source Code |

---

## 🔐 System Admin Credentials

For fast evaluation and administrative access:

| Field | Credential |
| :--- | :--- |
| 👤 **Admin Email** | `eswarrawsr2006@gmail.com` |
| 🔑 **Admin Password** | `Eswar2310@` |
| 🛡️ **Role** | `ADMIN` |

---

## ✨ Key Features

- 👥 **Role-Based Access Control (RBAC)**:
  - **Student**: Lodge complaints, track status in real-time, upload photo/document evidence, request role upgrades.
  - **Technician / Staff**: Manage assigned tickets, update resolution progress, post resolution comments.
  - **Admin**: Complete system control, assign staff/technicians to complaints, manage categories, view analytics dashboard.
- 📝 **Complaint Lifecycle Management**: Track status progression (`PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED` / `REJECTED`).
- ⚡ **Priority Matrix**: Automatic or manual prioritization (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- 📁 **Visual Evidence Attachments**: Drag-and-drop file uploader supporting evidence images and PDFs with inline lightbox preview.
- 🕵️ **Anonymous Complaints**: Student option to obscure identity on sensitive tickets (e.g. Harassment or Ragging cell).
- 💬 **Activity Timeline & Updates**: Comment feed tracking every status change, staff assignment, and discussion note.
- 🔐 **OTP Password Reset**: Secure 6-digit email OTP generation and password reset via JavaMailSender.
- 📊 **Analytics Dashboard**: Operational counters, category breakdown statistics, and technician workloads.

---

## 🛠️ Tech Stack & Architecture

### Backend
- **Framework**: Java 21, Spring Boot 3.3.3
- **Security**: Spring Security, JJWT (JSON Web Token authentication & stateless session management)
- **Persistence**: Spring Data JPA, Hibernate, PostgreSQL
- **Email Service**: JavaMailSender (SMTP) for OTP notifications
- **Database Connection Pool**: HikariCP (optimized for Render cloud resiliency)

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **HTTP Client**: Axios with JWT interceptors
- **State & Routing**: React Router v6

---

## 🔌 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (Student / Technician / Admin) |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user details |
| `POST` | `/api/auth/forgot-password` | Send 6-digit OTP to user email |
| `POST` | `/api/auth/reset-password` | Verify OTP and update user password |

### 📋 Complaints (`/api/complaints`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/complaints` | Lodge new complaint with optional file attachments (Multipart) |
| `GET` | `/api/complaints/my` | Retrieve logged-in student's complaints |
| `GET` | `/api/complaints` | Fetch all complaints (Admin/Technician) with status/category filters |
| `GET` | `/api/complaints/{id}` | Get full complaint details, timeline comments & attachments |
| `PUT` | `/api/complaints/{id}/status` | Update complaint status (`IN_PROGRESS`, `RESOLVED`, etc.) |
| `PUT` | `/api/complaints/{id}/assign` | Assign complaint to a technician/staff member (Admin) |
| `POST` | `/api/complaints/{id}/comments` | Post comment/update to timeline |
| `POST` | `/api/complaints/{id}/attachments` | Add extra file evidence |

### 📁 Attachments & Analytics (`/api/attachments` & `/api/analytics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/attachments/{fileName}` | Download or stream uploaded evidence attachment |
| `GET` | `/api/categories` | Retrieve list of complaint categories |
| `POST` | `/api/categories` | Create new category (Admin) |
| `GET` | `/api/analytics/summary` | Fetch dashboard counts & summary stats |
| `GET` | `/api/users/staff` | List available technicians/staff (Admin) |

---

## 💻 Local Development Setup

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+** & npm
- **Maven 3.8+**
- **PostgreSQL 14+** (or embedded H2 for quick local testing)

---

### 1️⃣ Backend Setup (Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Build application
mvn clean package -DskipTests

# Run Spring Boot application
mvn spring-boot:run
```

- **Backend Local URL**: `http://localhost:8082` (or `http://localhost:8080`)
- **Config file**: [backend/src/main/resources/application.properties](file:///d:/Complient%20management/backend/src/main/resources/application.properties)

---

### 2️⃣ Frontend Setup (React Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend Local URL**: `http://localhost:5173`

---

## ☁️ Deployment Configuration

### 🟢 Backend (Render)
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/complaint-system-1.0.0.jar`
- **Environment Variables**:
  - `SPRING_DATASOURCE_URL`: PostgreSQL JDBC URL
  - `SPRING_DATASOURCE_USERNAME`: DB Username
  - `SPRING_DATASOURCE_PASSWORD`: DB Password
  - `SPRING_MAIL_USERNAME`: SMTP Gmail Address
  - `SPRING_MAIL_PASSWORD`: SMTP App Password

### 🔵 Frontend (Vercel)
- **Framework Preset**: Vite / React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://complient-managent-backend.onrender.com`

---

## 📂 Project Directory Structure

```
Complient management/
├── backend/
│   ├── src/main/java/com/college/complaint/
│   │   ├── config/          # Security & DataInitializer
│   │   ├── controller/      # REST API Controllers
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities (User, Complaint, Category, etc.)
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── security/        # JWT Authentication Filter & Token Provider
│   │   └── service/         # Business Logic & Mail Service
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components & Badges
│   │   ├── context/         # Auth Context & Provider
│   │   ├── pages/           # Student, Admin & Staff Dashboards
│   │   └── services/        # Axios API Client
│   └── package.json
└── README.md
```

---

## 📄 License & Credits

Developed by **Eswar S** for Campus Resolution Management.
- GitHub: [@2310Eswar](https://github.com/2310Eswar)
- Email Support: `eswarrawsr2006@gmail.com`
