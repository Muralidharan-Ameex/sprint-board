## Tech Stack
- React
- Vite
- Vitest + React Tesing Library
- Accessibility (WCAG Compliant)

## Scripts
- npm run dev
- npm run build
- npx vitest

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Sprint Board – React (Vite) Assignment

A lightweight Kanban-style Sprint Board built using **React + Vite**.  
The application demonstrates clean component structure, state management, drag-and-drop behavior, user role permissions, and local persistence via `localStorage`.

---

## 1. Features Overview

- Kanban workflow with columns:
  **New → In Progress → Blocked → Resolved → Done**
- Create, view, edit, delete tasks
- Role-based permissions:
  - Admin → edit all tasks
  - User → edit only their assigned tasks
- User management (name, email, role)
- Drag-and-drop to move tasks between columns
- Unassigned tasks listed separately
- Data persistence using `localStorage`

---

## 2. Tech Stack

- **React 19**
- **Vite**
- **JavaScript (ES6+)**
- **CSS**
- **localStorage**

---

## 3. Project Setup Instructions

### Install dependencies
npm install

## Run development server
npm run dev

Open the URL shown in the terminal (usually http://localhost:5173).
## Build for production
npm run build

## Preview production build
npm run preview


---

4. Folder Structure

project-root/
├─ public/
│  ├─ data/
│     └─ sprint-data.json
│
├─ src/
│  ├─ SprintBoard.jsx     
│  ├─ SprintBoard.css      
│  ├─ components/         
│  │   ├─ Sidebar.jsx
│  │   ├─ BoardColumns.jsx
│  │   ├─ TaskEditModal.jsx
│  │   ├─ UnassignedRow.jsx
│  │
│  ├─ main.jsx
│
├─ package.json
├─ vite.config.js
└─ README.md


---

5. How the Application Works

## Initialization
1. Check localStorage for saved data
2. If missing → load /data/sprint-data.json
3. If missing → use default hardcoded DB


## UI Rendering
Sidebar: users + roles
Header: new task, new user
Board: task columns
Unassigned row

## Interactions
Create/edit/delete tasks
Assign users
Drag tasks between columns
Switch current user (filters board)

## Persistence
All changes to the db state are synced to localStorage:
localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

---

6. State Management

The main state object:

{
  users: [...],
  tasks: {
    new: [...],
    inprogress: [...],
    blocked: [...],
    resolved: [...],
    done: [...]
  },
  currentUserId: "u-admin"
}

## Hooks Used
useState → data + modal state
useEffect → initialization + persistence
useRef → drag-and-drop context

---

7. Maintainability Notes

Clear separation between UI components and business logic
Column definitions stored in a config (COLUMNS)
Single source of truth → db object
Centralized permission logic
Drag-and-drop isolated into simple handlers


---

8. Known Limitations

No backend
No authentication
Drag-and-drop not fully accessible
Minimal JSON validation

---

9. Testing
Framework: Vitest + React Testing Library
Coverage: Core user flows (CRUD, Validation)
Run tests: 'npx vitest'

---

👨‍💻 10. Author

Muralidharan Purushothaman
React Sprint Board – Technical Assignment
Built with Vite + React