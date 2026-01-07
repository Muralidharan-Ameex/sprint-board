import React, { useEffect, useState, useRef, useReducer } from "react";
import { useDispatch } from "react-redux";
import { setInitialData, addUser as addUserRedux } from "./sprintSlice";
import "./SprintBoard.css";

import { Sidebar } from "./components/Sidebar";
import { BoardColumns } from "./components/BoardColumns";
import { UnassignedRow } from "./components/UnassignedRow";
import { TaskEditModal } from "./components/TaskEditModal";

export const COLUMNS = [
  { id: "new", title: "New" },
  { id: "inprogress", title: "In Progress" },
  { id: "blocked", title: "Blocked" },
  { id: "resolved", title: "Resolved" },
  { id: "done", title: "Done" },
];

function userFormReducer(state, action){
  switch (action.type) {
    case "SET_NAME":
      return {...state, name: action.payload};
    case "SET_EMAIL":
      return {...state, email: action.payload};
    case "RESET":
      return { name: "", email: ""};
    default:
      return state;
  }
}

const STORAGE_KEY = "sprint-board-db:v3";
const DEFAULT_JSON_PATH = "/data/sprint-data.json";

function makeEmptyTasks() {
  const obj = {};
  COLUMNS.forEach(c => (obj[c.id] = []));
  return obj;
}

const SAMPLE_TASKS = {
  ...makeEmptyTasks(),
  new: [
    { id: "t-1", title: "Welcome to Sprint Board", assigneeId: null, state: "new", description: "Intro task" }
  ]
};

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_DB = {
  users: [{ id: "u-admin", name: "Admin", email: "admin@example.com", role: "admin" }],
  tasks: SAMPLE_TASKS,
  currentUserId: "u-admin"
};

export default function SprintBoard() {
  const [db, setDb] = useState(null);
  const dragItem = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let canceled = false;
    async function init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!canceled) setDb(parsed);
          dispatch(setInitialData(parsed));
          return;
        }
      } catch (e) {
        console.warn("localStorage read failed", e);
      }

      try {
        const res = await fetch(DEFAULT_JSON_PATH);
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (!canceled) {
          setDb(json);
          dispatch(setInitialData(parsed));
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(json)); } catch(e) {}
          return;
        }
      } catch (e) {
        console.warn("Could not load local JSON, falling back to default", e);
      }

      if (!canceled) setDb(DEFAULT_DB);
      dispatch(setInitialData(parsed));
    }
    init();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (!db) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) { console.warn(e); }
  }, [db]);

  const users = db?.users || [];
  const tasks = db?.tasks || makeEmptyTasks();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskView, setShowTaskView] = useState(null);
  const [showTaskEdit, setShowTaskEdit] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [newUserForm, setNewUserForm] = useState({ name: "", email: ""});
  const [userErrors, setUserErrors] = useState({ name: "", email: "" });
  const [taskErrors, setTaskErrors] = useState({ title: "", description: "" });
  const [newTaskForm, setNewTaskForm] = useState({ title: "", description: "", assigneeId: null});

  const [userFormState, dispatchUserForm] = React.useReducer(userFormReducer, {name: "", email: ""});

  function saveDb(patch) {
    setDb(prev => {
      const base = prev || { ...DEFAULT_DB };
      return typeof patch === "function" ? patch(base) : { ...base, ...patch };
    });
  }

  function closeCreateUserModal(){
    setShowCreateUser(false);
    setNewUserForm({ name: "", email: ""});
    setUserErrors({ name: "", email: "" });
  }

  function closeCreateTaskModal(){
    setShowCreateTask(false);
    setNewTaskForm({ title: "", description: "", assigneeId: null});
    setTaskErrors({ title: "", description: "" });
  }

  function addUser({ name, email}) {
    const errors = { name: "", email: "" };

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) errors.name = "Name is required";
    if (!trimmedEmail) errors.email = "Email is required";

    const normalizedName = name.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const nameExists = users.some(
      u =>
        u.name.trim().toLowerCase() === normalizedName 
    );
    if(nameExists) {
      errors.name = "This name already exists";
    }
    const emailExists = users.some(
      u =>
        u.email.trim().toLowerCase() === normalizedEmail
    );
    if(emailExists) {
      errors.email = "This email already exists";
    }
    // const isDuplicate = users.some(
    //   u =>
    //     u.name.trim().toLowerCase() === normalizedName &&
    //     u.email.trim().toLowerCase() === normalizedEmail
    // );
    // if (isDuplicate) {
    //   errors.name = "User already exists with this name";
    //   errors.email = "User already exists with this email";
    // }
    if (errors.name || errors.email) {
      setUserErrors(errors);
      return;
    }

    const u = { id: uid("u"), name, email, role: "user" };
    saveDb(prev => ({ ...prev, users: [...prev.users, u] }));

    dispatch(addUserRedux(u));

    closeCreateUserModal();
    setNewUserForm({ name: "", email: ""});
  }

  function addTask(_, partial = {}) {
    const errors = {title: "", description: ""};
    if (!partial.title?.trim()){
      errors.title = "Title is Required";
    }
    if(!partial.description?.trim()){
      errors.description = "Description is Required";
    }
    if(errors.title || errors.description){
      setTaskErrors(errors);
      return;
    }
    const task = {
      id: uid("t"),
      title: partial.title || "New task",
      assigneeId: partial.hasOwnProperty("assigneeId") ? partial.assigneeId : null,
      state: "new",
      // state: COLUMNS.some(c => c.id === columnId) ? columnId : "new",
      description: partial.description || ""
    };
    saveDb(prev => {
      const newTasks = { ...prev.tasks };
      newTasks.new = [...(newTasks.new || []), task];
      // newTasks[task.state] = [...(newTasks[task.state] || []), task];
      return { ...prev, tasks: newTasks };
    });
    closeCreateTaskModal();
    setNewTaskForm({ title: "", description: "", assigneeId: null});
    // setNewTaskForm({ title: "", description: "", assigneeId: null, columnId: "new" });
  }

  function findTaskById(id) {
    for (const col of Object.keys(tasks)) {
      const t = (tasks[col] || []).find(x => x.id === id);
      if (t) return { ...t, columnId: col };
    }
    return null;
  }

  function updateTaskLocation(fromColumnId, itemId, toColumnId) {
    setDb(prev => {
      const newTasks = { ...prev.tasks };
      if (!newTasks[fromColumnId] || !newTasks[toColumnId]) return prev;
      const fromArr = [...newTasks[fromColumnId]];
      const idx = fromArr.findIndex(i => i.id === itemId);
      if (idx === -1) return prev;
      const [item] = fromArr.splice(idx, 1);
      item.state = toColumnId;
      newTasks[fromColumnId] = fromArr;
      newTasks[toColumnId] = [item, ...(newTasks[toColumnId] || [])];
      return { ...prev, tasks: newTasks };
    });
  }

  function updateTask(columnId, itemId, patch) {
    setDb(prev => {
      const newTasks = { ...prev.tasks };
      // move to different state
      if (patch.state && patch.state !== columnId && newTasks[patch.state]) {
        const existing = (newTasks[columnId] || []).find(i => i.id === itemId);
        if (!existing) return prev;
        const moved = { ...existing, ...patch, state: patch.state };
        newTasks[columnId] = (newTasks[columnId] || []).filter(i => i.id !== itemId);
        newTasks[patch.state] = [moved, ...(newTasks[patch.state] || [])];
      } else {
        // update in-place
        newTasks[columnId] = (newTasks[columnId] || []).map(i => i.id === itemId ? { ...i, ...patch } : i);
      }
      return { ...prev, tasks: newTasks };
    });
  }

  function deleteTask(columnId, itemId) {
    const current = users.find(u => u.id === db?.currentUserId);
    if (!current || current.role !== "admin") {
      alert("Only admins can delete tasks.");
      return;
    }
    saveDb(prev => ({ ...prev, tasks: { ...prev.tasks, [columnId]: prev.tasks[columnId].filter(i => i.id !== itemId) } }));
  }

  function deleteUser(userId) {
    const current = users.find(u => u.id === db?.currentUserId);
    if (!current || current.role !== "admin") {
      alert("Only admins can delete users.");
      return;
    }
    const remaining = (users || []).filter(u => u.id !== userId);
    const hasAdmin = remaining.some(u => u.role === "admin");
    if (!hasAdmin) {
      alert("Cannot delete the last admin user.");
      return;
    }
    saveDb(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
  }

  function onDragStart(e, fromColumnId, itemId) {
    dragItem.current = { fromColumnId, itemId };
    e.dataTransfer?.setData("text/plain", itemId);
  }
  function onDrop(e, toColumnId) {
    e.preventDefault();
    const dragging = dragItem.current;
    if (!dragging) return;
    if (dragging.fromColumnId === toColumnId) { dragItem.current = null; return; }
    updateTaskLocation(dragging.fromColumnId, dragging.itemId, toColumnId);
    dragItem.current = null;
  }
  function onDragOver(e) { e.preventDefault(); }

  function handleUserSelect(userId) {
    saveDb({ currentUserId: userId });
  }

  function getUserNameById(id) {
    return users.find(u => u.id === id)?.name || "Unassigned";
  }

  function canEditTask(task) {
    const current = users.find(u => u.id === db?.currentUserId) || null;
    if (!current) return false;
    if (current.role === "admin") return true;
    return task.assigneeId === current.id;
  }

  const unassignedTasks = Object.keys(tasks)
    .flatMap(col => (tasks[col] || []).filter(t => !t.assigneeId).map(t => ({ ...t, columnId: col })));

  const currentUser = users.find(u => u.id === db?.currentUserId) || null;
  const isAdmin = currentUser?.role === "admin";

  function boardFilter(item) {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return item.assigneeId === currentUser.id;
  }

  async function importJsonFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json.users || !json.tasks) {
        alert("Invalid sprint JSON file. Required keys: users, tasks");
        return;
      }
      saveDb(json);
      alert("Imported sprint data successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to import JSON file: " + e.message);
    }
  }

  function handleFileInputChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = window.confirm("Importing will replace current board data in this browser. Continue?");
    if (!ok) return;
    importJsonFile(f);
    e.target.value = "";
  }

  // function exportJsonFile() {
  //   if (!db) return;
  //   const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "sprint-board-export.json";
  //   document.body.appendChild(a);
  //   a.click();
  //   a.remove();
  //   URL.revokeObjectURL(url);
  // }

  if (!db) {
    return <div className="sb-app">Loading board…</div>;
  }

  /* ---------- render ---------- */
  return (
    <div className="sb-app two-column">
      {/* Sidebar */}
      <Sidebar
        users={users}
        tasks={tasks}
        currentUserId={db.currentUserId}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
        onUserSelect={handleUserSelect}
        isAdmin={isAdmin}
        deleteUser={deleteUser}
      />

      <main className="sb-main">
        <header className="sb-header">
          <div>
            <h1>Sprint Board</h1>
            <div className="sb-sub">Select a user to filter the board. Unassigned tasks are shown separately below.</div>
          </div>

          {isAdmin && (
          <div className="sb-controls">
            {/* <select value={db.currentUserId || ""} onChange={(e) => handleUserSelect(e.target.value)}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.role === "admin" ? "(admin)" : ""}</option>)}
            </select> */}

            <button onClick={() => setShowCreateTask(true)}>+ New Task</button>
            <button onClick={() => setShowCreateUser(true)}>+ New User</button>

            {/* <input id="sb-import" style={{ display: 'none' }} type="file" accept="application/json" onChange={handleFileInputChange} /> */}
          </div>
          )}
        </header>

        <div className="sb-board-wrap">
          <div className="sb-board">
            <BoardColumns
              COLUMNS={COLUMNS}
              tasks={tasks}
              boardFilter={boardFilter}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragStart={onDragStart}
              findTaskById={findTaskById}
              getUserNameById={getUserNameById}
              canEditTask={canEditTask}
              setShowTaskView={(t) => setShowTaskView(t)}
              setShowTaskEdit={(t) => setShowTaskEdit(t)}
              deleteTask={deleteTask}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        <UnassignedRow
          unassignedTasks={unassignedTasks}
          boardFilter={boardFilter}
          getUserNameById={getUserNameById}
          setShowTaskView={(t) => setShowTaskView(t)}
          setShowTaskEdit={(t) => setShowTaskEdit(t)}
          deleteTask={deleteTask}
          isAdmin={isAdmin}
        />
      </main>

      {showCreateUser && (
        <div className="sb-modal-back" onClick={closeCreateUserModal}>
          <div className="sb-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="modal-title">Create User</h3>
            <label>
              Name *
              <input
                value={newUserForm.name}
                onChange={e => {
                  setNewUserForm(f => ({ ...f, name: e.target.value }));
                  setUserErrors(err => ({ ...err, name: "" }));
                }}
              />
              {userErrors.name && <div className="sb-error" role="alert">{userErrors.name}</div>}
            </label>
            <label>
              Email *
              <input
                value={newUserForm.email}
                onChange={e => {
                  setNewUserForm(f => ({ ...f, email: e.target.value }));
                  setUserErrors(err => ({ ...err, email: "" }));
                }}
              />
              {userErrors.email && <div className="sb-error" role="alert">{userErrors.email}</div>}
            </label>
            {/* <label>Role
              <select value={newUserForm.role} onChange={(e) => setNewUserForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label> */}
            <div className="sb-modal-actions">
              {/* <button onClick={closeCreateUserModal}>Cancel</button> */}
              <button onClick={()=>{
                dispatchUserForm({ type: "RESET"});
                closeCreateUserModal();
              }}>Cancel</button>
              <button onClick={() => addUser(newUserForm) }>Create</button>
            </div>
          </div>
        </div>
      )}

      {showCreateTask && (
        <div className="sb-modal-back" onClick={closeCreateTaskModal}>
          <div className="sb-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
            <h3>Create Task</h3>
            <label>Title *
              <input value={newTaskForm.title} onChange={e => {setNewTaskForm(f => ({ ...f, title: e.target.value })); setTaskErrors(err => ({...err, title: ""}));}} />
              {taskErrors.title && (<div className="sb-error" role="alert">{taskErrors.title}</div>)}
            </label>
            <label>Description *
              <textarea value={newTaskForm.description} onChange={e => {setNewTaskForm(f => ({ ...f, description: e.target.value })); setTaskErrors(err => ({...err, description: ""}));}} />
              {taskErrors.description && (<div className="sb-error" role="alert">{taskErrors.description}</div>)}
            </label>
            <label>Assignee
              <select value={newTaskForm.assigneeId || ""} onChange={(e) => setNewTaskForm(f => ({ ...f, assigneeId: e.target.value || null }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            {/* <label>State
              <select value={newTaskForm.columnId} onChange={(e) => setNewTaskForm(f => ({ ...f, columnId: e.target.value }))}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label> */}

            <div className="sb-modal-actions">
              <button onClick={closeCreateTaskModal}>Cancel</button>
              <button onClick={() => addTask(null, newTaskForm)}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showTaskView && (
        <div className="sb-modal-back" onClick={() => setShowTaskView(null)}>
          <div className="sb-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
            <h3>{showTaskView.title}</h3>
            <div><strong>Assignee:</strong> {getUserNameById(showTaskView.assigneeId)}</div>
            <div><strong>State:</strong> {showTaskView.state}</div>
            <div style={{ marginTop: 8 }}><strong>Description</strong><div className="sb-desc">{showTaskView.description || "—"}</div></div>
            <div className="sb-modal-actions"><button onClick={() => setShowTaskView(null)}>Close</button></div>
          </div>
        </div>
      )}

      {showTaskEdit && (
        <TaskEditModal
          initial={showTaskEdit}
          users={users}
          canEdit={canEditTask(showTaskEdit)}
          isAdmin={isAdmin}
          onClose={() => setShowTaskEdit(null)}
          onSave={(patch) => {
            updateTask(showTaskEdit.columnId, showTaskEdit.id, patch);
            setShowTaskEdit(null);
          }}
          COLUMNS={COLUMNS}
        />
      )}
    </div>
  );
}