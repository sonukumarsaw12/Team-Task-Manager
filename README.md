# TaskFlow – Team Collaboration & Workflow Manager

TaskFlow is a comprehensive team collaboration platform where users can create projects, assign tasks, manage teams, and track progress using a clean dashboard and Kanban board system.

## 🚀 Features

- **Role-Based Access Control**: Admin and Member roles with specific permissions.
- **Kanban Board**: Drag-and-drop task management powered by `dnd-kit`.
- **Real-time Notifications**: Socket.io integration for instant updates on task assignments and status changes.
- **File Attachments**: Upload and manage files using Cloudinary.
- **Activity Logging**: Track every significant action across projects.
- **Dark Mode**: Full dark mode support.
- **Dashboard Analytics**: Visual overview of task statuses.

## ⚙️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS & Shadcn UI
- Framer Motion
- React Hook Form + Zod
- Recharts

**Backend:**
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT Authentication (Access + Refresh Tokens)
- Socket.io
- Multer & Cloudinary
- Jest & Supertest

## 🛠️ Setup Instructions (Local Dev)

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Team Task Manager"
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Run the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Run the frontend development server:
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

To run the backend test suite:

```bash
cd backend
npm test
```

## 🌐 Deployment

- **Frontend**: Ready to be deployed to Vercel.
- **Backend**: Ready to be deployed to Railway.
- **Database**: Use MongoDB Atlas.
- **CI/CD**: GitHub Actions workflow included in `.github/workflows/deploy.yml`.

Ensure all environment variables are added to your hosting providers and GitHub Secrets.
