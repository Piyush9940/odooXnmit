# Dayflow HR & Employee Management System

Dayflow is a modern, full-stack HR and Employee Management System designed to streamline attendance tracking, leave requests, payroll processing, document management, and administrative reporting for organizations.

Built with a **Vanilla JavaScript, HTML5, and CSS3** frontend connected via native `fetch()` API calls to a **Node .js, Express, and MongoDB** RESTful backend with JWT Bearer authentication.

---

## 🌟 Key Features

### 🔐 Authentication & Access Control
- **Role-Based Access Control**: Separate privileges for `ADMIN` and `EMPLOYEE` accounts.
- **Secure Registration & Login**: Password hashing with bcrypt, JWT Access & Refresh token authorization.
- **Email Verification**: Integration with Resend email service for account verification.

### 👥 Employee Management
- **Complete Profiles**: Track personal details, job designations, departments, joining dates, and employment types.
- **Admin Control**: Create, update, search, filter, and deactivate employee records.

### ⏱️ Smart Attendance & Work Logs
- **One-Click Check-In / Check-Out**: Employees can log daily work shifts and work modes (Office / Remote).
- **Automatic Hours Calculation**: Pre-save hook automatically calculates total working hours.
- **Admin Overview**: View and manage company-wide attendance logs and summaries.

### 🏖️ Leave Management
- **Leave Applications**: Apply for Paid, Sick, or Unpaid leave with date range calculation.
- **Approval Workflow**: Admins can review, approve, or reject leave requests with comments.
- **Real-time Status Tracking**: View pending, approved, and rejected leave history.

### 💰 Payroll & Salary Slips
- **Automated Salary Calculation**: Basic salary, allowances, bonuses, and deductions computation.
- **PDF Payslip Generation**: Generate and download PDF salary slips directly from the browser.
- **Payroll Auditing**: Admins can draft, process, and track monthly payroll records.

### 📂 Document Management & Notifications
- **Document Storage**: Upload and manage employee identity proofs, certificates, and contracts.
- **Notifications Engine**: In-app and email alerts for leave approvals, announcements, and system events.

### 📊 Analytics & Reports
- **Interactive Dashboards**: Data visualizations powered by Chart.js for attendance trends and leave metrics.
- **Department Breakdown**: High-level reporting for administrative oversight.

---

## 🏗️ Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Interface                       │
│    HTML5  •  Vanilla CSS3 / Bootstrap  •  Vanilla JS (ES6+) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Native fetch() API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     RESTful API Layer                       │
│             Node.js  •  Express.js  •  JWT Auth             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database & Services                      │
│      MongoDB / MongoMemoryServer  •  Cloudinary  •  Resend  │
└─────────────────────────────────────────────────────────────┘
```

### Stack Components
- **Frontend**: HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Bootstrap
- **Backend Framework**: Node.js, Express.js (v5)
- **Database**: MongoDB with Mongoose ORM (Supports MongoMemoryServer fallback)
- **Security**: JWT (JsonWebToken), BcryptJS, Helmet, CORS
- **Validation**: Joi Schema Validation
- **Testing**: Jest, Supertest

---

## 📁 Project Structure

```text
oddoXnmit/
├── Backend/
│   ├── config/             # DB & External Service Configs
│   ├── controllers/        # Express Route Controllers
│   ├── middleware/         # Auth, Error, Role & Validation Middlewares
│   ├── models/             # Mongoose Data Schemas (User, Employee, Attendance, Leave, etc.)
│   ├── routes/             # API Route Definitions
│   ├── services/           # Business Logic Layer
│   ├── tests/              # Jest Unit & Integration Test Suites
│   ├── utils/              # Helper utilities (JWT, Passwords, Tokens)
│   ├── validators/         # Joi Request Validation Schemas
│   ├── app.js              # Express Application Setup
│   ├── server.js           # Server Entry Point
│   └── package.json
│
├── frontend/
│   ├── js/                 # Central API Layer Modules
│   │   ├── api.js          # Core fetch() wrapper with Bearer token & error handling
│   │   ├── auth.js         # Authentication helpers (login, register, logout)
│   │   ├── employee.js     # Employee API module
│   │   ├── attendance.js   # Attendance API module
│   │   ├── leave.js        # Leave API module
│   │   ├── payroll.js      # Payroll API module
│   │   ├── document.js     # Document upload & management module
│   │   ├── notification.js # Notification API module
│   │   └── report.js       # Reports API module
│   ├── admin-dashboard.html    # Admin Portal Interface
│   ├── admin-dashboard.js      # Admin Portal Logic & API Wiring
│   ├── employee-dashboard.html # Employee Portal Interface
│   ├── employee-dashboard.js   # Employee Portal Logic & API Wiring
│   ├── sign-in.html            # Authentication Sign-In Page
│   ├── sign-up.html            # User Registration Page
│   └── homepagenew.html        # Landing Page
│
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone & Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create or verify the `.env` file in the `Backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/dayflow
CLIENT_URL=http://localhost:3000,http://localhost:5000,http://127.0.0.1:5500
FRONTEND_URL=http://localhost:5000
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=Dayflow <noreply@yourdomain.com>
```

### 3. Start the Backend API Server

```bash
# Production / Normal start
npm start

# Development mode with auto-reload
npm run dev
```

The server will launch on `http://localhost:5000`. You can test health status at `http://localhost:5000/api/health`.

### 4. Launch the Frontend Interface

Open `frontend/sign-in.html` or `frontend/homepagenew.html` in any web browser or serve using VS Code Live Server / HTTP server.

---

## 🧪 Testing

The backend includes a complete test suite powered by Jest, Supertest, and MongoMemoryServer.

Run all test suites:

```bash
cd Backend
npm test
```

### Test Coverage Summary
- **Auth Tests** (`tests/auth.test.js`): 100% Pass
- **Employee Tests** (`tests/employee.test.js`): 100% Pass
- **Attendance Tests** (`tests/attendance.test.js`): 100% Pass
- **Leave Tests** (`tests/leave.test.js`): 100% Pass
- **Payroll Tests** (`tests/payroll.test.js`): 100% Pass
- **Notification Tests** (`tests/notification.test.js`): 100% Pass
- **Total**: 6 Test Suites, 60 Tests Passed (100%)

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch current user details | Protected |
| `GET` | `/api/employees/me` | View logged-in employee profile | Employee |
| `PATCH` | `/api/employees/me` | Update personal profile details | Employee |
| `GET` | `/api/employees` | List all employees | Admin |
| `POST` | `/api/employees` | Create new employee profile | Admin |
| `POST` | `/api/attendance/check-in` | Record daily check-in | Employee |
| `POST` | `/api/attendance/check-out` | Record daily check-out | Employee |
| `GET` | `/api/attendance/me` | View personal attendance history | Employee |
| `POST` | `/api/leaves` | Apply for leave | Employee |
| `GET` | `/api/leaves/me` | View submitted leave requests | Employee |
| `PATCH` | `/api/leaves/:id/approve` | Approve leave request | Admin |
| `PATCH` | `/api/leaves/:id/reject` | Reject leave request | Admin |
| `GET` | `/api/payroll/me` | Fetch current salary history | Employee |
| `GET` | `/api/reports/admin-dashboard` | Get administrative metrics & stats | Admin |

---

## 📜 License

This project is open-source and available under the MIT License.
