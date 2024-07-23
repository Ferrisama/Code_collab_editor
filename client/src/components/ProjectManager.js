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
} from "firebase/firestore";

function ProjectManager({ user, setCurrentProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareProjectId, setShareProjectId] = useState("");

  useEffect(() => {
    const db = getFirestore();
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("users", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [user]);

  const createProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const db = getFirestore();
      const newProject = await addDoc(collection(db, "projects"), {
        name: newProjectName,
        users: [user.uid],
        createdAt: new Date(),
        content: "",
      });
      setNewProjectName("");
      setCurrentProject({
        id: newProject.id,
        name: newProjectName,
        content: "",
      });
    }
  };

  const deleteProject = async (projectId) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "projects", projectId));
  };

  const shareProject = async (e) => {
    e.preventDefault();
    if (shareEmail && shareProjectId) {
      const db = getFirestore();
      const projectRef = doc(db, "projects", shareProjectId);
      await updateDoc(projectRef, {
        users: [
          ...projects.find((p) => p.id === shareProjectId).users,
          shareEmail,
        ],
      });
      setShareEmail("");
      setShareProjectId("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-between items-center">
            <span
              onClick={() => setCurrentProject(project)}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded flex-grow"
            >
              {project.name}
            </span>
            <button
              onClick={() => deleteProject(project.id)}
              className="bg-red-500 text-white px-2 py-1 rounded ml-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={createProject} className="mt-4">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project Name"
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
        >
          Create Project
        </button>
      </form>
      <form onSubmit={shareProject} className="mt-4">
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
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-2 w-full p-2 bg-green-500 text-white rounded"
        >
          Share Project
        </button>
      </form>
    </div>
  );
}

export default ProjectManager;
