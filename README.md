# Smart Task & Team Management Portal

A full-stack project management and collaboration workspace designed for agile teams. This application enables team leaders to set up project outlines, invite team members, assign tasks, and track statuses in a beautiful responsive Kanban Board.

---

## 🚀 Tech Stack

### Frontend
- **React (Vite)** — Single Page Application setup
- **Tailwind CSS** — Fluid custom layouts, gradients, and responsive utility-first styles
- **React Router v6** — Client-side page routing and Protected Routes
- **React Hot Toast** — Real-time event notifications
- **Axios** — HTTP client with interceptors for token headers
- **Lucide React** — Elegant vector icons

### Backend
- **Node.js + Express.js** — REST API backend
- **MongoDB Atlas + Mongoose** — Document-oriented database storage and object-document mapping
- **JWT (JsonWebToken)** — Header-based authentication token
- **Bcrypt.js** — Salt hashing passwords on-save
- **Dotenv** — Environment variable isolation

---

## 📦 Project Structure

```
smart-task/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express request controller functions
│   ├── middleware/         # Auth verify & global error handlers
│   ├── models/             # Mongoose schemas (User, Project, Task)
│   ├── routes/             # Express routing maps
│   ├── server.js           # Server entry file
│   └── .env                # Server configuration secrets
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client instance
│   │   ├── components/     # UI elements (Navbar, Cards, Modals)
│   │   ├── context/        # Auth react context provider
│   │   ├── pages/          # Login, Dashboard, Profile views
│   │   ├── App.jsx         # App routing and layout
│   │   ├── index.css       # Tailwind directives
│   │   └── main.jsx        # Root mount file
│   ├── index.html          # HTML entry point
│   ├── tailwind.config.js  # Content paths and custom theme
│   └── .env                # API base endpoint config
└── README.md
```

---

## 💾 MongoDB Schema Design

### User Schema (`User.js`)
- `name`: `String` (Required, trimmed)
- `email`: `String` (Required, unique, validated email regex, lowercase)
- `password`: `String` (Required, bcrypt hashed)
- `avatar`: `String` (Default: Dicebear Initials matching user name)
- `timestamps`: `true`

### Project Schema (`Project.js`)
- `name`: `String` (Required, trimmed)
- `description`: `String`
- `deadline`: `Date`
- `owner`: `ObjectId` (Ref: User, Required)
- `members`: `[ObjectId]` (Ref: User)
- `timestamps`: `true`

### Task Schema (`Task.js`)
- `title`: `String` (Required, trimmed)
- `description`: `String`
- `status`: `String` (Enum: `['Todo', 'In Progress', 'Done']`, Default: `Todo`)
- `priority`: `String` (Enum: `['Low', 'Medium', 'High']`, Default: `Medium`)
- `dueDate`: `Date`
- `assignedTo`: `ObjectId` (Ref: User, Required)
- `project`: `ObjectId` (Ref: Project, Required)
- `timestamps`: `true`

---

## 🔌 API Endpoints List

### Authentication Route (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user, hashes password, returns token | No |
| **POST** | `/login` | Log in user, verifies credentials, returns token | No |
| **GET** | `/me` | Get logged-in user profile details & statistics counters | Yes |
| **PUT** | `/me` | Update name, email, avatar, or password | Yes |

### Project Route (`/api/projects`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Fetch all projects where user is owner or member | Yes |
| **POST** | `/` | Create a new project, resolves collaborator emails | Yes |
| **GET** | `/:id` | Fetch details of a project populated with its tasks list | Yes |
| **PUT** | `/:id` | Update project parameters (names, members, deadline) | Yes (Owner only) |
| **DELETE**| `/:id` | Delete a project folder and cascade delete tasks | Yes (Owner only) |

### Task Route (`/api/tasks`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a new task in a project | Yes |
| **GET** | `/project/:projectId` | Fetch all tasks for a specific project folder | Yes |
| **PUT** | `/:id` | Update task details (status, priority, assignee) | Yes |
| **DELETE**| `/:id` | Remove task from project directory | Yes |

---

## 🛠️ Installation & Setup

Follow these steps to run the portal locally.

### Prerequisites
- Node.js (v16+) installed
- MongoDB database (local MongoDB server or Atlas cluster connection)

### 1. Database & Server Setup (Backend)
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=any_strong_jwt_signing_key_12345
   JWT_EXPIRE=7d
   ```
4. Start the server (Dev mode with Nodemon):
   ```bash
   npm run dev
   ```

### 2. Frontend Portal Setup
1. Open a new terminal and navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run Vite client developer server:
   ```bash
   npm run dev
   ```
5. Click the local host URL shown (e.g. `http://localhost:5173`) in your browser.

---

## 📌 Architectural Assumptions

1. **User Collaboration**: Collaborators are added to projects by typing their registered email address inside the creation or edit modal. The system queries their accounts and appends their ObjectIds to the project's member list.
2. **Cascade Deletes**: Deleting a project folder will delete all tasks linked to that project ID from the Database.
3. **Task Assignment**: Tasks can only be assigned to users who are members of that project (the Owner or any collaborator). This constraint is enforced in the Frontend UI through select dropdown lists.
4. **Local Development defaults**: MongoDB connection defaults to localhost (`mongodb://localhost:27017/smart_task_db`) to simplify running the backend.
