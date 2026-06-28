# Tasko | Multi-Tenant Team & Project Management Portal

Tasko is a premium, full-stack collaborative project workspace designed for organizations. It features multi-tenant organization boundaries, strict Role-Based Access Control (RBAC) separating Admins and Members, and a responsive Kanban board for task orchestration.

---

## 🔗 Live Deployments

- **Frontend Portal (Vercel)**: [https://tasko-management.vercel.app](https://tasko-management.vercel.app)
- **Backend API (Render)**: [https://tasko-lazu.onrender.com](https://tasko-lazu.onrender.com)
- **API Health Endpoint**: [https://tasko-lazu.onrender.com/health](https://tasko-lazu.onrender.com/health)

---

## 🚀 Key Features

- **Multi-Tenant Workspaces**: Users register by either creating a new organization or joining an existing one. Database queries for users, projects, and tasks are strictly scoped to the user's organization.
- **Role-Based Access Control (RBAC)**:
  - **Admin (Org Creator)**: Full permissions to create/edit/delete projects, add tasks, edit/delete tasks, and assign items.
  - **Member (Joined Org)**: View-only access to boards, with the ability to modify the status of tasks assigned specifically to them.
- **Task Management**: Grouped "My Tasks" view for assignees, automatic sidebar status-count badges, and real-time statistics.
- **State-of-the-Art Aesthetics**: Modern glassmorphism themes, dynamic dark mode support, and micro-interactions.

---

## 📦 Project Structure

```
tasko/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express request controller functions (auth, project, task)
│   ├── middleware/         # Session verify, RBAC, self-healing migration fallback
│   ├── models/             # Mongoose schemas (Organization, User, Project, Task)
│   ├── routes/             # Express routing maps
│   └── server.js           # Server entry file
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client with interceptors
│   │   ├── components/     # UI elements (Navbar, Sidebar, ProjectCard, TaskCard, Modal, Spinner)
│   │   ├── context/        # Auth context provider
│   │   ├── pages/          # Login, Register, Dashboard, ProjectDetails, Profile, MyTasks
│   │   ├── App.jsx         # Router configuration
│   │   └── index.css       # Tailwind directives
│   ├── index.html          # HTML entry point with favicon
│   └── vercel.json         # SPA router routing rewrites
└── README.md
```

---

## 💾 MongoDB Schema Design

### Organization (`Organization.js`)
- `name`: `String` (Required, unique, trimmed, case-insensitive check)

### User (`User.js`)
- `name`: `String` (Required, trimmed)
- `email`: `String` (Required, unique, validated email format, lowercase)
- `password`: `String` (Required, bcrypt hashed)
- `organization`: `ObjectId` (Ref: `Organization`, Required)
- `role`: `String` (Enum: `['admin', 'member']`, Default: `member`)

### Project (`Project.js`)
- `name`: `String` (Required, trimmed)
- `description`: `String`
- `deadline`: `Date`
- `owner`: `ObjectId` (Ref: `User`, Required)
- `organization`: `ObjectId` (Ref: `Organization`, Required)

### Task (`Task.js`)
- `title`: `String` (Required, trimmed)
- `description`: `String`
- `status`: `String` (Enum: `['Todo', 'In Progress', 'Done']`, Default: `Todo`)
- `priority`: `String` (Enum: `['Low', 'Medium', 'High']`, Default: `Medium`)
- `dueDate`: `Date`
- `assignedTo`: `ObjectId` (Ref: `User`, Nullable)
- `project`: `ObjectId` (Ref: `Project`, Required)

---

## 🔌 API Endpoints List

### Authentication Route (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user, hashes password, returns token | No |
| **POST** | `/login` | Log in user, verifies credentials, returns token | No |
| **GET** | `/me` | Get logged-in user profile details & statistics counters | Yes |
| **PUT** | `/me` | Update profile name | Yes |
| **GET** | `/users` | Get all registered users within the user's organization | Yes |
| **GET** | `/organizations` | Get list of all organizations | No |

### Project Route (`/api/projects`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Fetch all projects scoped to the user's organization | Yes |
| **POST** | `/` | Create a new project in the organization | Yes (Admin only) |
| **GET** | `/:id` | Fetch project details populated with its tasks list | Yes |
| **PUT** | `/:id` | Update project parameters | Yes (Owner or Admin only) |
| **DELETE**| `/:id` | Delete a project folder and cascade delete tasks | Yes (Owner or Admin only) |

### Task Route (`/api/tasks`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a new task in a project | Yes (Admin only) |
| **GET** | `/project/:projectId` | Fetch all tasks for a specific project | Yes |
| **PUT** | `/:id` | Update task details (Admin) / Update status only (Assignee) | Yes |
| **DELETE**| `/:id` | Remove task from project board | Yes (Admin only) |
| **GET** | `/assigned-to-me` | Fetch all tasks assigned to the current user | Yes |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Database

### 1. Backend Setup
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   JWT_EXPIRE=7d
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
