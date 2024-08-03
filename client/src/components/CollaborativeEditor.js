import React, { useState, useEffect, useRef, useContext } from "react";
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
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { ThemeContext } from "../contexts/ThemeContext";
import UserCursor from "./UserCursor";

const languageMap = {
  javascript,
  python,
  cpp,
  java,
  html,
  css,
  json,
};

function CollaborativeEditor({ user, project }) {
  const [code, setCode] = useState(project.content || "");
  const [language, setLanguage] = useState(project.language || "javascript");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cursorPositions, setCursorPositions] = useState({});
  const editorRef = useRef(null);
  const { darkMode } = useContext(ThemeContext);
  //const markersRef = useRef({});

  useEffect(() => {
    const db = getFirestore();
    const projectRef = doc(db, "projects", project.id);
    const usersRef = collection(db, "projects", project.id, "users");

    const unsubscribeProject = onSnapshot(
      projectRef,
      (doc) => {
        if (doc.exists()) {
          setCode(doc.data().content || "");
          setLanguage(doc.data().language || "javascript");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching project:", err);
        setError("Failed to load project. Please try again.");
        setLoading(false);
      }
    );

    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const activeUsers = snapshot.docs.map((doc) => doc.data());
      setUsers(activeUsers);

      const cursors = {};
      snapshot.docs.forEach((doc) => {
        const userData = doc.data();
        if (userData.id !== user.uid && userData.cursor) {
          cursors[userData.id] = {
            ...userData.cursor,
            email: userData.email,
          };
        }
      });
      setCursorPositions(cursors);
    });

    // Set user presence and initial cursor position
    setDoc(
      doc(usersRef, user.uid),
      {
        id: user.uid,
        email: user.email,
        lastSeen: new Date(),
        cursor: { line: 0, ch: 0 },
      },
      { merge: true }
    );

    // Remove user when they leave
    return () => {
      unsubscribeProject();
      unsubscribeUsers();
      updateDoc(doc(usersRef, user.uid), { lastSeen: null, cursor: null });
    };
  }, [project.id, user]);

  const handleChange = (value, viewUpdate) => {
    setCode(value);
    const db = getFirestore();
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, { content: value });

    // Update cursor position
    const cursor = viewUpdate.state.selection.main.head;
    const line = viewUpdate.state.doc.lineAt(cursor).number - 1;
    const ch = cursor - viewUpdate.state.doc.line(line + 1).from;
    updateCursorPosition(line, ch);

    // Update cursor positions of other users
    if (viewUpdate.view) {
      const cursors = { ...cursorPositions };
      Object.keys(cursors).forEach((userId) => {
        const cursor = cursors[userId];
        const pos = viewUpdate.state.doc.line(cursor.line + 1).from + cursor.ch;
        const coords = viewUpdate.view.coordsAtPos(pos);
        if (coords) {
          cursors[userId] = { ...cursor, top: coords.top, left: coords.left };
        }
      });
      setCursorPositions(cursors);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    const db = getFirestore();
    const projectRef = doc(db, "projects", project.id);
    updateDoc(projectRef, { language: newLanguage });
  };

  const updateCursorPosition = (line, ch) => {
    const db = getFirestore();
    const userRef = doc(db, "projects", project.id, "users", user.uid);
    updateDoc(userRef, { cursor: { line, ch } });
  };

  const editorTheme = EditorView.theme(
    {
      "&": {
        backgroundColor: darkMode ? "#1F2937" : "#ffffff",
        color: darkMode ? "#D1D5DB" : "#000000",
      },
      ".cm-gutters": {
        backgroundColor: darkMode ? "#374151" : "#f3f4f6",
        color: darkMode ? "#9CA3AF" : "#4B5563",
        border: "none",
      },
      ".cm-activeLineGutter": {
        backgroundColor: darkMode ? "#4B5563" : "#E5E7EB",
      },
      ".cm-activeLine": {
        backgroundColor: darkMode ? "#374151" : "#F3F4F6",
      },
      ".cm-selectionMatch": {
        backgroundColor: darkMode ? "#4B5563" : "#D1D5DB",
      },
      ".cm-cursor": {
        borderLeftColor: darkMode ? "#D1D5DB" : "#000000",
      },
      ".cm-lineNumbers": {
        color: darkMode ? "#9CA3AF" : "#4B5563",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: darkMode ? "#4B5563" : "#D1D5DB",
        color: darkMode ? "#D1D5DB" : "#000000",
      },
    },
    { dark: darkMode }
  );

  // Custom extension to display other users' cursors
  const cursorExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged || update.selectionSet) {
      const cursor = update.state.selection.main.head;
      const line = update.state.doc.lineAt(cursor).number - 1;
      const ch = cursor - update.state.doc.line(line + 1).from;
      updateCursorPosition(line, ch);
    }
  });

  // Add this useEffect for cursor markers
  useEffect(() => {
    if (editorRef.current && editorRef.current.view) {
      //const editor = editorRef.current.view;
      const markers = {};

      return () => {
        Object.values(markers).forEach((marker) => marker.remove());
      };
    }
  }, [cursorPositions, user.uid]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        {project.name}
      </h2>
      {loading && (
        <p className="text-gray-600 dark:text-gray-300">Loading editor...</p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Active Users:
        </h3>
        <ul className="list-disc list-inside">
          {users.map((user) => (
            <li key={user.id} className="text-gray-600 dark:text-gray-400">
              {user.email}
              {user.cursor &&
                ` (Line: ${user.cursor.line + 1}, Column: ${
                  user.cursor.ch + 1
                })`}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label
          htmlFor="language-select"
          className="text-gray-700 dark:text-gray-300 mr-2"
        >
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          {Object.keys(languageMap).map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      {!loading && (
        <>
          <CodeMirror
            value={code}
            height="400px"
            extensions={[javascript({ jsx: true }), cursorExtension]}
            onChange={handleChange}
            ref={editorRef}
            theme={editorTheme}
            className="border rounded"
            onCreateEditor={(view) => {
              editorRef.current = { view };
            }}
          />
          {Object.entries(cursorPositions).map(([userId, cursor]) => (
            <UserCursor
              key={userId}
              top={cursor.top}
              left={cursor.left}
              color={`#${userId.slice(0, 6)}`}
              name={cursor.email}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default CollaborativeEditor;
