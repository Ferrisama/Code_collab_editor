import React, { useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import Register from "./components/Register";
import ProjectManager from "./components/ProjectManager";
import CollaborativeEditor from "./components/CollaborativeEditor";
import { ThemeContext } from "./contexts/ThemeContext";
import BackgroundWaves from "./components/BackgroundWaves";

function App() {
  const [user, setUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

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
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
    <div
      className={`min-h-screen ${
        darkMode ? "dark" : ""
      } relative overflow-hidden`}
    >
      <BackgroundWaves />
      <div className="relative z-10">
        <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 min-h-screen">
          <header className="bg-gray-100 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-90 shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Collaborative Code Editor
              </h1>
              <div className="flex items-center">
                {user && (
                  <span className="mr-4 text-gray-600 dark:text-gray-300">
                    Logged in as: {user.email}
                  </span>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="mr-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded transition duration-300"
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {!user ? (
              <div className="bg-white bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-90 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Welcome
                </h2>
                <div className="space-y-4">
                  <Login />
                  <Register />
                </div>
              </div>
            ) : (
              <div className="flex space-x-6">
                <div className="w-1/3">
                  <ProjectManager
                    user={user}
                    setCurrentProject={setCurrentProject}
                  />
                </div>
                <div className="w-2/3">
                  {currentProject ? (
                    <CollaborativeEditor
                      user={user}
                      project={currentProject}
                      key={darkMode ? "dark" : "light"}
                    />
                  ) : (
                    <div className="bg-white bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-90 p-6 rounded-lg shadow">
                      <p className="text-gray-600 dark:text-gray-300">
                        Select a project to start editing
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
