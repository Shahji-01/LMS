# 🎓 LMS - Advanced Learning Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-orange.svg)](LICENSE)

A state-of-the-art, full-stack Learning Management System (LMS) designed for scablity and premium user experience. This platform enables instructors to create, manage, and sell courses, while providing students with a seamless, interactive learning journey.

---

## 🚀 Key Features

### 👤 Student Features
- **Course Discovery**: Advanced search and filtering by categories.
- **Interactive Learning**: Dynamic lecture player with progress tracking.
- **Assessments**: Take quizzes and receive instant feedback.
- **Community**: Course discussions and note-taking features.
- **Certificates**: Automatically generated PDF certificates upon course completion.
- **Wishlist & Cart**: Save courses for later or purchase them instantly.
- **Secure Checkout**: Integrated with **Stripe** and **Razorpay** for global payments.

### 👨‍🏫 Instructor Features
- **Course Creator**: Comprehensive dashboard to build and edit courses.
- **Media Management**: High-speed video uploads powered by **Cloudinary**.
- **Analytics Dashboard**: Track student enrollment, course ratings, and revenue.
- **Quiz Builder**: Create custom assessments for each course.
- **Revenue Management**: Payout tracking and revenue analytics.
- **Coupon System**: Create and manage discounts for courses.

### 🛠️ Admin Features
- **Global Overview**: Real-time analytics of users, courses, and transactions.
- **User Moderation**: Manage roles and permissions (Student, Instructor, Admin).
- **Course Approval**: Review and publish instructor-submitted content.
- **Category Management**: Organize the platform's taxonomy.

### 🛡️ Security & Reliability
- **Graceful Shutdown**: Handles `SIGINT` and `SIGTERM` signals for clean disconnection of DBs and workers.
- **Advanced Security**: 
  - **Helmet**: Custom CSP for secure integration with Cloudinary and Stripe.
  - **Rate Limiting**: Tiered protection for APIs, course viewing, and checkout.
  - **Strict Validation**: Zod-based strictly-typed configurations and request validation.
- **Observability**: Structured JSON logging with **Pino** and integrated health monitoring.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Vite)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: React Hook Form + Zod Validation

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Caching & Queues**: [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/)
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly Cookies
- **Logging**: [Pino](https://getpino.io/)

### Infrastructure & Services
- **Payments**: Stripe & Razorpay
- **Media**: Cloudinary Storage
- **Emails**: Nodemailer + Mailgen
- **Monitoring**: Sentry SDK
- **DevOps**: Docker, Nginx, PM2

---

## 📂 Project Structure

```text
├── client/                # React Vite Frontend
│   ├── src/
│   │   ├── api/          # Axios & React Query hooks
│   │   ├── components/   # Shared UI components
│   │   ├── layouts/      # Page wrappers (Main, Dashboard)
│   │   ├── pages/        # View components
│   │   ├── Store/        # Redux logic
│   │   └── utils/        # Helpers
├── server/                # Express Backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # 3rd party integrations
│   │   ├── queues/       # BullMQ producers
│   │   └── workers/      # BullMQ consumers
├── nginx/                 # Reverse proxy configuration
└── docker-compose.yml     # Container orchestration
```

---

## 📊 Database Models

The system architecture is built around 16 specialized Mongoose models:
- **Core**: `User`, `Course`, `Lecture`, `Category`
- **Engagement**: `Review`, `Discussion`, `Note`, `Quiz`, `QuizSubmission`
- **Commerce**: `CoursePurchase`, `Coupon`, `Payout`, `Wishlist`
- **Insights**: `Analytics`, `Notification`, `CourseProgress`

---

## 📡 Advanced Frontend Features

- **PWA (Progressive Web App)**: Optimized for offline use with `vite-plugin-pwa` (standalone display, theme-colored).
- **Session Hydration**: Automatic auth bootstrap through Redux middleware on load.
- **Monitoring**: Production-ready error tracking with **Sentry** and global **Error Boundaries**.
- **SEO Ready**: Dynamic meta tags and titles via `react-helmet-async`.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis (Optional, for queues)

### 1. Clone the repository
```bash
git clone <repository-url>
cd LMS
```

### 2. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env variables (Cloudinary, Stripe, MongoDB URI)

# Optional: Seed the database with demo courses and categories
npm run seed

# Create your first Admin user
npm run create-admin

npm run dev
```

### 3. Client Setup
```bash
cd ../client
npm install
npm run dev
```

### 4. Docker Setup (Recommended)
```bash
docker-compose up --build
```

---

## 🔑 Environment Variables

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_URL` | Redis connection for BullMQ |
| `CLOUDINARY_URL` | For media uploads |
| `STRIPE_SECRET_KEY` | Stripe payment integration |
| `RAZORPAY_KEY` | Razorpay payment integration |
| `SMTP_HOST` | Email server configuration |

---

## 📖 API Documentation

The project includes a comprehensive API documentation powered by **Swagger**. 
Once the server is running, visit:
`http://localhost:8000/api-docs`

---

## 📜 Available Scripts

### Backend
- `npm run dev`: Start server in development mode (Nodemon)
- `npm run start`: Start production server
- `npm run seed`: Seed the database with demo data
- `npm run create-admin`: Create an initial admin user

### Frontend
- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

## 🔧 Troubleshooting

### Redis Connection Error
If you see `Redis connection to localhost:6379 failed`, ensure Redis is running:
```bash
# MacOS/Linux
brew services start redis
# Windows (WSL)
sudo service redis-server start
```

### Video Uploads
Video processing requires a valid Cloudinary configuration. If uploads fail, check your `CLOUDINARY_URL` and ensures `ENABLE_QUEUES=true` is set.

---

**Developed with ❤️ by **Shahji**
