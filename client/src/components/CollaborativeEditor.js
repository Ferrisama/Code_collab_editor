import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  collection,
  setDoc,
} from "firebase/firestore";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

function CollaborativeEditor({ user, project }) {
  const [code, setCode] = useState(project.content || "");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    const db = getFirestore();
    const projectRef = doc(db, "projects", project.id);
    const usersRef = collection(db, "projects", project.id, "users");

    setLoading(true);
    setError("");

    const unsubscribeProject = onSnapshot(
      projectRef,
      (doc) => {
        if (doc.exists()) {
          setCode(doc.data().content || "");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching project:", err);
        setError("Failed to load project. Please try again.");
        setLoading(false);
      }
    );

    const unsubscribeUsers = onSnapshot(
      usersRef,
      (snapshot) => {
        const activeUsers = snapshot.docs.map((doc) => doc.data());
        setUsers(activeUsers);
      },
      (err) => {
        console.error("Error fetching users:", err);
      }
    );

    // Set user presence
    setDoc(
      doc(usersRef, user.uid),
      {
        id: user.uid,
        email: user.email,
        lastSeen: new Date(),
      },
      { merge: true }
    );

    // Remove user when they leave
    return () => {
      unsubscribeProject();
      unsubscribeUsers();
      updateDoc(doc(usersRef, user.uid), { lastSeen: null });
    };
  }, [project.id, user]);

  const handleChange = (value) => {
    setCode(value);
    const db = getFirestore();
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, { content: value });
  };

  const handleCursorActivity = (editor) => {
    const cursor = editor.getCursor();
    const db = getFirestore();
    const userRef = doc(db, "projects", project.id, "users", user.uid);
    updateDoc(userRef, { cursor: { line: cursor.line, ch: cursor.ch } });
  };

  // Add this useEffect for cursor markers
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.view;
      const markers = {};

      users.forEach((user) => {
        if (user.id !== user.uid && user.cursor) {
          const { line, ch } = user.cursor;
          const pos = editor.coordsAtPos(
            editor.state.doc.line(line + 1).from + ch
          );
          if (pos) {
            const marker = document.createElement("div");
            marker.className = "remote-cursor";
            marker.style.left = `${pos.left}px`;
            marker.style.top = `${pos.top}px`;
            marker.setAttribute("title", user.email);
            editor.dom.appendChild(marker);
            markers[user.id] = marker;
          }
        }
      });

      return () => {
        Object.values(markers).forEach((marker) => marker.remove());
      };
    }
  }, [users, user.uid]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{project.name}</h2>
      {loading && <p className="text-gray-600">Loading editor...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Active Users:</h3>
        <ul className="list-disc list-inside">
          {users.map((user) => (
            <li key={user.id} className="text-gray-600">
              {user.email}
            </li>
          ))}
        </ul>
      </div>
      {!loading && (
        <CodeMirror
          value={code}
          height="400px"
          extensions={[javascript({ jsx: true })]}
          onChange={handleChange}
          ref={editorRef}
          className="border rounded"
        />
      )}
    </div>
  );
}

export default CollaborativeEditor;
