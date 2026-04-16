# NextGen School — Setup Guide

A full-stack EdTech platform built with Next.js 16, NextAuth v5, and Neon PostgreSQL.

## Stack
- **Framework**: Next.js 16 App Router
- **Auth**: NextAuth v5 (JWT, Credentials provider)
- **Database**: PostgreSQL via Neon Serverless
- **UI**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **ORM**: Raw SQL via `@neondatabase/serverless`

---

## Quick Start

### 1. Create a Neon Database
1. Go to https://console.neon.tech and sign up
2. Create a new project (free tier works)
3. Copy the connection string from the dashboard

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run the Database Schema
In your Neon dashboard → **SQL Editor**, run these two files **in order**:
1. `scripts/001-create-tables.sql`
2. `scripts/002-seed-admin.sql`

### 4. Install & Run
```bash
pnpm install
pnpm dev
```
Open http://localhost:3000

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@nextgenschool.com | demo123 | Admin |
| teacher@nextgenschool.com | demo123 | Teacher |
| student@nextgenschool.com | demo123 | Student |

> ⚠️ The seed script uses a bcrypt hash for `demo123`. Update it for production.

---

## Role Capabilities

### 👨‍🎓 Student
- Browse and enroll in approved courses
- Take timed quizzes with auto-grading
- Submit text assignments
- View grades and feedback
- Earn certificates on course completion

### 👩‍🏫 Teacher
- Create courses (pending admin approval)
- Add modules with video URLs and text content
- Create MCQ quizzes with configurable time limits and passing scores
- Create assignments with due dates
- View all student enrollments and progress

### 🛡️ Admin
- Approve / reject teachers and institutions
- Approve / reject / unpublish courses
- View and delete all users
- View full platform stats on dashboard

### 🏫 Institution
- View all linked students and their progress
- Performance analytics with charts
- Export enrollment data as CSV

---

## Project Structure

```
app/
├── (auth)/
│   ├── login/           Login page
│   └── register/        Register page
├── (dashboard)/
│   ├── student/         Student dashboard + courses/quizzes/assignments/certs
│   ├── teacher/         Teacher dashboard + courses/quizzes/assignments/enrollments
│   ├── admin/           Admin dashboard + users/approvals/courses
│   └── institution/     Institution dashboard + students/performance/reports
├── api/
│   ├── auth/            NextAuth handlers + register
│   ├── admin/           Admin APIs
│   ├── teacher/         Teacher APIs
│   ├── student/         Student APIs
│   └── institution/     Institution APIs
├── pending-approval/    Shown to unapproved teachers/institutions
└── page.tsx             Landing page
lib/
├── auth.ts              NextAuth config
├── db.ts                Neon SQL client
└── types.ts             TypeScript interfaces
scripts/
├── 001-create-tables.sql   Schema
└── 002-seed-admin.sql      Seed data
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Set these environment variables in your Vercel project settings:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → your production URL

