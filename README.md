<<<<<<< HEAD
# aa
=======
# 🚀 TaskFlow — Smart Task Manager

A full-stack task management web app with user authentication, CRUD operations, dark/light mode, and responsive design.

---

## 📸 Screenshots
> Add your screenshots here after running the app.

---

## 🛠 Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | HTML, CSS, Vanilla JS        |
| Backend    | Node.js + Express.js         |
| Database   | MongoDB + Mongoose           |
| Auth       | JWT (JSON Web Tokens)        |
| Passwords  | bcryptjs (hashed)            |

---

## 📁 Project Structure

```
smart-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Task.js           # Task schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth (signup, login, me)
│   │   └── tasks.js          # /api/tasks (CRUD + toggle)
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js             # Main Express server
│
└── frontend/
    ├── css/
    │   └── style.css         # Global styles + dark/light variables
    ├── js/
    │   ├── auth.js           # Login/Signup logic
    │   ├── dashboard.js      # Dashboard init, user info, theme
    │   └── tasks.js          # Task CRUD, search, filter, render
    ├── index.html            # Login / Signup page
    └── dashboard.html        # Main dashboard
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+) — https://nodejs.org
- MongoDB — https://www.mongodb.com/try/download/community (local) OR use MongoDB Atlas (cloud, free)
- Git — https://git-scm.com

---


### 1 Backend Setup
```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_task_manager
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRE=7d
```

> For MongoDB Atlas (cloud), your MONGO_URI looks like:
> `mongodb+srv://username:password@cluster.mongodb.net/smart_task_manager`

Start the backend:
```bash
npm run dev     # Development (with auto-restart)
# OR
npm start       # Production
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
```

---

### 2 Frontend Setup
No build step needed! Just open the files.

**Option A — Live Server (recommended for development)**
- Install VS Code extension "Live Server"
- Right-click `frontend/index.html` → Open with Live Server

**Option B — Direct file**
- Double-click `frontend/index.html` to open in browser

> ⚠️ Make sure the `API_BASE` in `js/auth.js` and `js/dashboard.js` points to `http://localhost:5000/api`

---

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint           | Description         | Auth Required |
|--------|-------------------|---------------------|---------------|
| POST   | /api/auth/signup  | Register new user   | ❌            |
| POST   | /api/auth/login   | Login user          | ❌            |
| GET    | /api/auth/me      | Get logged-in user  | ✅            |

### Task Routes (all require auth)
| Method | Endpoint                  | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/tasks               | Get all tasks (+ filter) |
| POST   | /api/tasks               | Create new task          |
| GET    | /api/tasks/:id           | Get single task          |
| PUT    | /api/tasks/:id           | Update task              |
| DELETE | /api/tasks/:id           | Delete task              |
| PATCH  | /api/tasks/:id/complete  | Toggle complete          |

### Query Parameters for GET /api/tasks
```
?search=keyword
?status=pending|in-progress|completed
?priority=low|medium|high
?category=work|personal|health|finance|education|other
?sort=newest|oldest|due-date|title|priority
```

---

## ✨ Features

- ✅ User Signup & Login with JWT authentication
- ✅ Passwords hashed with bcrypt (secure)
- ✅ Full CRUD for tasks (Create, Read, Update, Delete)
- ✅ Toggle task complete/incomplete
- ✅ Search tasks by title/description
- ✅ Filter by status, priority, category
- ✅ Sort tasks multiple ways
- ✅ Task stats dashboard (total, pending, in-progress, done)
- ✅ Due date with overdue warning
- ✅ Dark / Light mode toggle (saved in localStorage)
- ✅ Responsive design (mobile + desktop)
- ✅ Toast notifications
- ✅ Loading states on all buttons

---

## 🚀 Deployment

### Backend — Render.com (Free)
1. Push backend folder to GitHub
2. Go to render.com → New → Web Service
3. Connect GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add Environment Variables (PORT, MONGO_URI, JWT_SECRET)

### Frontend — Netlify (Free)
1. Drag and drop `frontend` folder at netlify.com/drop
2. Update `API_BASE` in `auth.js` and `dashboard.js` to your Render backend URL
>>>>>>> ecdc8b8 (first commit)
