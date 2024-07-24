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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Collaborative Code Editor
          </h1>
          <div className="space-y-4">
            <Login />
            <div className="text-center text-gray-600">or</div>
            <Register />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Collaborative Code Editor
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">
              Logged in as: {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex space-x-6">
          <div className="w-1/3">
            <ProjectManager user={user} setCurrentProject={setCurrentProject} />
          </div>
          <div className="w-2/3">
            {currentProject ? (
              <CollaborativeEditor user={user} project={currentProject} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">
                  Select a project to start editing
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
