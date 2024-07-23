import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import Register from "./components/Register";
import ProjectManager from "./components/ProjectManager";
import CollaborativeEditor from "./components/CollaborativeEditor";

function App() {
  const [user, setUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setCurrentProject(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Collaborative Code Editor</h1>
        <div className="flex space-x-4">
          <Login />
          <Register />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Collaborative Code Editor</h1>
      <p>Logged in as: {user.email}</p>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <ProjectManager user={user} setCurrentProject={setCurrentProject} />
        </div>
        <div className="w-3/4">
          {currentProject ? (
            <CollaborativeEditor user={user} project={currentProject} />
          ) : (
            <p className="text-gray-500">Select a project to start editing</p>
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default App;
