import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

function ProjectManager({ user, setCurrentProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareProjectId, setShareProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    console.log("Current user email:", user.email); // Debug log

    setLoading(true);
    setError("");

    const db = getFirestore();
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("users", "array-contains", user.email));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError("Failed to fetch projects. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim() && user) {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();
        const newProject = await addDoc(collection(db, "projects"), {
          name: newProjectName,
          users: [user.email],
          createdAt: new Date(),
          content: "",
        });
        setNewProjectName("");
        setCurrentProject({
          id: newProject.id,
          name: newProjectName,
          content: "",
        });
      } catch (err) {
        console.error("Error creating project:", err);
        setError("Failed to create project. Please try again.");
      }
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    setLoading(true);
    setError("");
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "projects", projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    }
    setLoading(false);
  };

  const shareProject = async (e) => {
    e.preventDefault();
    if (shareEmail && shareProjectId) {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();
        const projectRef = doc(db, "projects", shareProjectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          if (!projectData.users.includes(shareEmail)) {
            await updateDoc(projectRef, {
              users: [...projectData.users, shareEmail],
            });
            setShareEmail("");
            setShareProjectId("");
          } else {
            setError("This user already has access to the project.");
          }
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        console.error("Error sharing project:", err);
        setError("Failed to share project. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Projects</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-2 mb-4">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex justify-between items-center bg-gray-50 p-3 rounded"
          >
            <span
              onClick={() => setCurrentProject(project)}
              className="cursor-pointer hover:text-blue-600 transition duration-300"
            >
              {project.name}
            </span>
            <button
              onClick={() => deleteProject(project.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition duration-300"
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={createProject} className="mb-6">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project Name"
          className="w-full p-2 border rounded mb-2"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-300"
          disabled={loading}
        >
          Create Project
        </button>
      </form>
      <form onSubmit={shareProject}>
        <select
          value={shareProjectId}
          onChange={(e) => setShareProjectId(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          disabled={loading}
        >
          <option value="">Select a project to share</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          type="email"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          placeholder="Email to share with"
          className="w-full p-2 border rounded mb-2"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-300"
          disabled={loading}
        >
          Share Project
        </button>
      </form>
    </div>
  );
}

export default ProjectManager;
