# 🛒 E-Cart Mobile Backend  
> **Status:** 🚧 In Development  

## 📌 Overview  
Backend service for the **E-Cart mobile app**, providing APIs for user authentication, product management, cart operations, and order processing.  

---

## ⚙️ Tech Stack 
- **Node.js + Express.js** – REST API backend
- **Typescript** 
- **PostgreSQL** – database  
- **JWT** – authentication  
- **Twilio** – SMS OTP (trial) (Removed)  
- **Nodemailer** – Email Sender  
- **Redis** - In-memory Caching
- **Node Cron** - Scheduling Background Jobs
- **Otplib** - OTP Handler (Email, Google Authenticator, etc.)
- **Express Validator** - Validator
- **Express Rate Limit** - Rate Limiter
- **Cookie Parser** - For cookie based auth (Refresh token)
- **Docker** - Containerization for reproductible environments
- **MVC** - Architecture (with service layer)
- **MakeFile** - Automates build, test, and project builds


---

## 🚀 Features  
- User Registration, Login, Forgot Password
- Multi-Factor Authentication (MFA)
- OTP Authentication (Email/SMS)
- oAuth
- Product
- Categories
- Cart Management   
- Orders & Checkout Flow  
- Caching (Performance Optimization)
- RBAC (user, seller, admin)

---


### :bulb: Steps
```bash
# Clone the repository
git clone <repo-url>
cd e-cart-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update .env with your DB credentials, JWT secrets, Redis config, etc.

# Run database migrations (if applicable)
npm run migrate

# Start development server
npm run dev
```

---


### :card_file_box: Folder Structure
```bash
e-cart-backend/
├── db/
│   ├── migrations/     # Migration files
│   ├── seeders/        # Seeder Files
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models
│   ├── middlewares/    # Express middlewares
│   ├── utils/          # Helpers & utilities
│   ├── routers/        # API routes
│   ├── validators/     # Express Validators
│   └── workers/        # Background Jobs
├── migrations/         # Database migrations
├── Dockerfile          # Container setup
├── Makefile            # Build/test automation
├── .env.example        # Sample environment variables
└── README.md
```

