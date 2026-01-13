import React, { useState, useEffect } from "react";
import "./LoginPage.css";

const STORAGE_KEY = "sprint-board-db:v3";
const DEFAULT_JSON_PATH = "/data/sprint-data.json";

export default function LoginPage({ onLoginSuccess }) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [users, setUsers] = useState([]);

  // Load all users (admin + existing + new)
  useEffect(() => {
    async function loadUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUsers(parsed.users || []);
          return;
        }
      } catch (err) {
        console.warn("LocalStorage Error:", err);
      }

      // Fallback: load JSON
      try {
        const res = await fetch(DEFAULT_JSON_PATH);
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.warn("JSON Load Error:", err);
      }
    }

    loadUsers();
  }, []);

  function handleLogin(e) {
    e.preventDefault();

    const { username, password } = loginForm;

    const user = users.find(
      (u) =>
        u.name.toLowerCase() === username.toLowerCase().trim() &&
        u.email.toLowerCase() === password.toLowerCase().trim()
    );

    if (user) {
      setLoginError("");
      onLoginSuccess(user); // Send user to App.jsx
    } else {
      setLoginError("Invalid username or password");
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {loginError && <div className="login-error">{loginError}</div>}

        <form onSubmit={handleLogin}>
          <label className="login-label">Username</label>
          <input
            className="login-input"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm({ ...loginForm, username: e.target.value })
            }
            placeholder="eg: Admin or Alice"
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            placeholder="eg: admin@example.com"
          />

          <button className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}