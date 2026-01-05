# API Routes Documentation

This document lists all available API routes for frontend integration.

Base URL: `/api/v1`

---

## 1. User Routes (`/user`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/signup` | Create a new user | No |
| POST | `/signin` | Login user | No |
| POST | `/signout` | Logout user | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password/:token` | Reset password using token | No |
| GET | `/profile` | Get current logged-in user profile | Yes |
| PATCH | `/profile` | Update user profile (avatar upload supported) | Yes |
| PATCH | `/change-password` | Change user password | Yes |
| DELETE | `/account` | Delete user account | Yes |

---

## 2. Course Routes (`/course`)

| Method | Route | Description | Auth Required | Role |
|--------|-------|-------------|---------------|------|
| GET | `/published` | Get all published courses | No | - |
| GET | `/search` | Search courses | No | - |
| POST | `/` | Create new course | Yes | Instructor |
| GET | `/` | Get courses created by logged-in instructor | Yes | Instructor |
| GET | `/c/:courseId` | Get details of a single course | Yes | Any |
| PATCH | `/c/:courseId` | Update course details | Yes | Instructor |
| GET | `/c/:courseId/lectures` | Get all lectures of a course | Yes | Any |
| POST | `/c/:courseId/lectures` | Add lecture to course | Yes | Instructor |

---

## 3. Course Progress Routes (`/progress`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/:courseId` | Get user progress for a course | Yes |
| PATCH | `/:courseId/lectures/:lectureId` | Update progress of a lecture | Yes |
| PATCH | `/:courseId/complete` | Mark course as completed | Yes |
| PATCH | `/:courseId/reset` | Reset course progress | Yes |

---

## 4. Media Routes (`/media`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/upload-video` | Upload video file | No |

---

## 5. Course Purchase Routes (`/purchase`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/checkout/create-checkout-session` | Create Stripe checkout session | Yes |
| POST | `/webhook` | Stripe webhook to verify payment | No |
| GET | `/course/:courseId/detail-with-status` | Get course details with purchase status | Yes |
| GET | `/` | Get all courses purchased by the user | Yes |

---

## 6. Razorpay Routes (`/razorpay`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/create-order` | Create Razorpay order | Yes |
| POST | `/verify-payment` | Verify Razorpay payment | Yes |

---

## 7. Health Check Route (`/health`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/` | Check server health | No |

---

### Notes

- **Public routes**: `/user/signup`, `/user/signin`, `/user/forgot-password`, `/user/reset-password/:token`, `/course/published`, `/course/search`, `/media/upload-video`, `/health`
- **Authenticated routes**: Most `/user/*` profile routes, `/course/*` updates and lectures, `/progress/*`, `/purchase/*`, `/razorpay/*`
- **Instructor-only routes**: Creating/updating courses and adding lectures
