import React from "react";

export function UnassignedRow({
  unassignedTasks,
  boardFilter,
  setShowTaskView,
  setShowTaskEdit
}) {
  return (
    <section className="sb-unassigned-row">
      <h3>Unassigned Tasks</h3>

      <div className="sb-unassigned-list">
        {unassignedTasks.length > 0 ? (
          unassignedTasks.filter(boardFilter).map(task => (
            <div key={task.id} className="card-compact">
              <div className="card-top">
                <div className="card-main">
                  <div className="card-title">{task.title}</div>
                  <div className="card-sub">Column: {task.columnId}</div>
                </div>

                <div className="card-meta">
                  <div className="badge small">
                    <span className={`state-dot state-${task.state}`}></span>
                  </div>
                  <div className="badge count">1</div>
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => setShowTaskView(task)}>View</button>
                <button onClick={() => setShowTaskEdit(task)}>Edit</button>
              </div>
            </div>
          ))
        ) : (
          <div className="sb-empty">No unassigned tasks</div>
        )}
      </div>
    </section>
  );
}