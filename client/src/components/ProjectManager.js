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

  useEffect(() => {
    if (!user) return;

    console.log("Current user email:", user.email); // Debug log

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
        console.log("Fetched projects:", projectList); // Debug log
        setProjects(projectList);
      },
      (error) => {
        console.error("Error fetching projects:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim() && user) {
      try {
        const db = getFirestore();
        const newProject = await addDoc(collection(db, "projects"), {
          name: newProjectName,
          users: [user.email],
          createdAt: new Date(),
          content: "",
        });
        console.log("Created new project:", newProject.id); // Debug log
        setNewProjectName("");
        setCurrentProject({
          id: newProject.id,
          name: newProjectName,
          content: "",
        });
      } catch (error) {
        console.error("Error creating project:", error);
      }
    }
  };

  const deleteProject = async (projectId) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "projects", projectId));
  };

  const shareProject = async (e) => {
    e.preventDefault();
    if (shareEmail && shareProjectId) {
      try {
        const db = getFirestore();
        const projectRef = doc(db, "projects", shareProjectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          console.log("Project data before sharing:", projectData); // Debug log
          if (!projectData.users.includes(shareEmail)) {
            await updateDoc(projectRef, {
              users: [...projectData.users, shareEmail],
            });
            console.log("Project shared with:", shareEmail); // Debug log
          } else {
            console.log("User already has access to this project"); // Debug log
          }
        } else {
          console.log("Project not found"); // Debug log
        }

        setShareEmail("");
        setShareProjectId("");
      } catch (error) {
        console.error("Error sharing project:", error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Projects</h2>
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
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-300"
        >
          Create Project
        </button>
      </form>
      <form onSubmit={shareProject}>
        <select
          value={shareProjectId}
          onChange={(e) => setShareProjectId(e.target.value)}
          className="w-full p-2 border rounded mb-2"
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
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-300"
        >
          Share Project
        </button>
      </form>
    </div>
  );
}

export default ProjectManager;
