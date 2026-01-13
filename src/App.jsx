import React, { useState } from "react";
import SprintBoard from "./SprintBoard";
import LoginPage from "./components/LoginPage";
import "./App.css";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null); // stores the user object

  function handleLoginSuccess(user) {
    // user = { id, name, email, role }
    setLoggedInUser(user);

    const raw = localStorage.getItem("sprint-board-db:v3");
    if(raw){
      const db = JSON.parse(raw);
      db.currentUserId = user.id;
      localStorage.setItem("sprint-board-db:v3", JSON.stringify(db));
    }
  }

  function handleLogout() {
    setLoggedInUser(null);
  }

  // If not logged in → show Login Page
  if (!loggedInUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in → show Sprint Board
  return <SprintBoard currentUser={loggedInUser} onLogout={handleLogout} />;
}

export default App;