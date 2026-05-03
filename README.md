# 🚀 TaskFlow: The Ultimate Team Synergy Platform

[![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/your-repo)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express.js-blue)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **Transform the way your team works.** TaskFlow isn't just another project management tool; it's a productivity ecosystem designed to eliminate chaos and foster real-time collaboration with a premium, glassmorphic experience.

---

## 📸 Visual Preview

| Desktop Dashboard | Kanban Board |
| :---: | :---: |
| (<img width="2867" height="1628" alt="Screenshot 2026-05-03 170227" src="https://github.com/user-attachments/assets/0b5c1572-7d62-45c6-8cf9-b8b879ff9090" />
) (<img width="2879" height="1618" alt="Screenshot 2026-05-03 170218" src="https://github.com/user-attachments/assets/ee3a6d45-fb6d-4664-ace6-bb65b0d39f81" />
) |

*(Note: Add your actual screenshots in the `docs/assets` folder and update these links!)*

---

## 🧩 The Problem & Our Solution

### The Challenge
Teams today are overwhelmed by "notification fatigue" and fragmented workflows. Important updates get lost in long chat threads, and tracking task progress across multiple spreadsheets leads to miscommunication and missed deadlines.

### The TaskFlow Solution
We built **TaskFlow** to be the single source of truth for your project. By combining **Real-time Synchronization** with an **Intuitive Kanban System**, we bridge the gap between planning and execution. 
- **No more "Who is doing what?"**: Clear task ownership and status tracking.
- **No more "Where is that file?"**: Integrated Cloudinary storage for seamless asset management.
- **No more "Is it done yet?"**: Live activity logs and visual analytics.

---

## ✨ Core Features & Unique Innovation

### 🏗️ Advanced Kanban Ecosystem
Move beyond simple lists. Our drag-and-drop board is powered by `@dnd-kit`, offering smooth animations and instant state persistence. Tasks aren't just cards; they are rich data entities containing attachments, comments, and priority levels.

### ⚡ Real-Time Pulse
Powered by **Socket.io**, TaskFlow updates instantly. When an Admin reassigns a task or a member updates a status, the entire team sees it happen in real-time. No manual refreshes, no delays.

### 📊 Visual Intelligence
Don't just track tasks; analyze them. Our dashboard features interactive **Recharts** visualizations that provide a 360-degree view of project health, team workload, and completion rates at a single glance.

### 🔐 Enterprise-Grade Security
Built with a "Security First" mindset using **JWT (Access + Refresh Tokens)**, **Helmet**, and **Express-Rate-Limit**. Your data is protected, and access is strictly controlled via granular Role-Based Access Control (RBAC).

---

## 🛠️ Tech Stack

### Frontend (The Face)
- **Framework:** Next.js 16 (React 19, App Router)
- **Styling:** Tailwind CSS 4 + Shadcn UI
- **Animations:** Framer Motion
- **State Management:** React Hook Form + Zod (for validation)
- **Visuals:** Recharts & Lucide Icons

### Backend (The Brain)
- **Environment:** Node.js & Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Real-time:** Socket.io
- **Storage:** Cloudinary (via Multer)
- **Security:** Bcrypt, JWT, Helmet

---

## 🚀 Getting Started

Follow these steps to get your own instance of TaskFlow running locally.

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account
- Cloudinary Account

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 3. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_another_secret_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Start the engine:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Launch the UI:
```bash
npm run dev
```

---

## 🌐 Deployment & Production

### Backend
Recommended: **Railway** or **Render**.
- Ensure you set all Environment Variables in the provider's dashboard.
- Set the `NODE_ENV` to `production`.

### Frontend
Recommended: **Railway** or **Vercel**.
- Connect your GitHub repo.
- The build command should be `npm run build`.
- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built By Sonu Kumar Saw with ❤️ .
</p>
