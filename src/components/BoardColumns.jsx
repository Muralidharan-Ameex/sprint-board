import React from "react";

export function BoardColumns({
  COLUMNS,
  tasks,
  boardFilter,
  onDragStart,
  onDrop,
  findTaskById,
  setShowTaskView,
  setShowTaskEdit,
  deleteTask,
  isAdmin
}) {
  return (
    <div className="sb-board">
      {COLUMNS.map(col => (
        <section key={col.id} className="sb-column">
          <div className="sb-column-head">
            <h2>{col.title}</h2>
          </div>

          <div
            className="sb-column-body"
            onDrop={e => onDrop(e, col.id)}
            onDragOver={e => e.preventDefault()}
          >
            {(tasks[col.id] || [])
              .filter(boardFilter)
              .map(item => (
                <article
                  key={item.id}
                  draggable
                  className="card-compact column-card"
                  onDragStart={e => onDragStart(e, col.id, item.id)}
                >
                  {/* Card Header */}
                  <div className="card-top">
                    <div className="card-main">
                      <div className="card-title">{item.title}</div>
                      <div className="card-sub">
                        {item.assigneeId ? item.assigneeId : "Unassigned"}
                      </div>
                    </div>

                    <div className="card-meta">
                      <div className="badge small">
                        <span className={`state-dot state-${item.state}`} />
                      </div>
                      {/* <div className="badge count">●</div> */}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions">
                    <button onClick={() => setShowTaskView(findTaskById(item.id))}>
                      View
                    </button>

                    <button
                      onClick={() => {
                        const fullTask = findTaskById(item.id);
                        setShowTaskEdit(fullTask);
                      }}
                    >
                      Edit
                    </button>

                    {isAdmin && (
                        <button
                        aria-label="Delete task"
                        onClick={() => {
                            if (window.confirm("Delete this task?")) {
                            deleteTask(col.id, item.id);
                            }
                        }}
                        >
                        🗑
                        </button>
                    )}
                  </div>
                </article>
              ))}
          </div>

          <div className="sb-column-empty" />
        </section>
      ))}
    </div>
  );
}