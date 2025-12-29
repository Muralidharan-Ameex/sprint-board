import React, { useState } from "react";
import { COLUMNS } from "../SprintBoard";

export function TaskEditModal({
  initial,
  users,
  canEdit = true,
  isAdmin = false,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    assigneeId: initial.assigneeId ?? null,
    state: initial.state
  });

  /* ---------- NEW: error state ---------- */
  const [error, setError] = useState("");

  const STATE_TRANSITIONS = {
    new: ["inprogress", "blocked", "resolved", "done"],
    inprogress: ["blocked", "resolved", "done"],
    blocked: ["inprogress", "resolved", "done"],
    resolved: ["inprogress", "blocked", "done"],
    done: ["inprogress"]
  };

  function handleChange(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setError(""); // clear error on change
  }

  let allowedStates = STATE_TRANSITIONS[initial.state] || [];
  if (isAdmin && initial.state !== "new") {
    allowedStates = ["new", ...allowedStates];
  }

  function handleSave() {
    if (!canEdit) return;

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.state
    ) {
      setError("Asterisk fields are mandatory");
      return;
    }

    onSave(form);
  }

  function handleClose() {
    setError("");
    onClose();
  }

  return (
    <div className="sb-modal-back" onClick={handleClose}>
      <div className="sb-modal" onClick={e => e.stopPropagation()}>
        <h3>Edit Task</h3>

        {error && <div className="sb-error">{error}</div>}

        <label>
          Title *
          <input
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            disabled={!canEdit}
          />
        </label>

        <label>
          Description *
          <textarea
            value={form.description}
            onChange={e => handleChange("description", e.target.value)}
            disabled={!canEdit}
          />
        </label>

        <label>
          Assignee
          <select
            value={form.assigneeId || ""}
            onChange={e => handleChange("assigneeId", e.target.value || null)}
            disabled={!canEdit}
          >
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          State
          <select
            value={form.state}
            onChange={e => handleChange("state", e.target.value)}
            disabled={!canEdit}
          >
            <option value={initial.state} disabled>
              {COLUMNS.find(c => c.id === initial.state)?.title}
            </option>

            {allowedStates.map(stateId => {
              const col = COLUMNS.find(c => c.id === stateId);
              return (
                <option key={stateId} value={stateId}>
                  {col?.title || stateId}
                </option>
              );
            })}
          </select>
        </label>

        {!canEdit && (
          <div style={{ color: "#c00", marginTop: 8 }}>
            You are not allowed to edit this task.
          </div>
        )}

        <div className="sb-modal-actions">
          <button onClick={handleClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}