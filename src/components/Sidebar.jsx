import React from "react";

export function Sidebar({ users, tasks, currentUserId, collapsed, onToggle, onUserSelect }) {
  return (
    <aside className={`sb-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sb-sidebar-head">
        <strong>Users</strong>
        <button className="sb-small" onClick={onToggle}>
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      <div className="sb-userlist">
        {users.map(user => {
          const assignedCount = Object.values(tasks)
            .flat()
            .filter(t => t.assigneeId === user.id).length;

          return (
            <div
              key={user.id}
              className={`sb-user-item ${currentUserId === user.id ? "active" : ""}`}
              onClick={() => onUserSelect(user.id)}
            >
              <div className="sb-user-top">
                <div>
                  <div className="sb-user-name">
                    {user.name} {user.role === "admin" ? "(admin)" : ""}
                  </div>
                  <div className="sb-user-meta">{user.email}</div>
                </div>
              </div>

              {/* Expanded Content */}
              <div className="sb-user-collapse">
                <div>Role: {user.role}</div>
                <div>Assigned: {assignedCount}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}