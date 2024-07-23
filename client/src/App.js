import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import io from "socket.io-client";
import Login from "./components/Login";
import Register from "./components/Register";

const socket = io("http://localhost:5000");

function App() {
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [token, setToken] = useState(localStorage.getItem("token"));
  const roomId = "demo-room"; // In a real app, this would be dynamic

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      socket.emit("joinRoom", roomId);

      socket.on("codeUpdate", (updatedCode) => {
        setCode(updatedCode);
      });
    }

    return () => {
      socket.off("codeUpdate");
    };
  }, [token]);

  const handleChange = (value) => {
    setCode(value);
    socket.emit("codeChange", { roomId, code: value });
  };

  if (!token) {
    return (
      <div>
        <h1>Collaborative Code Editor</h1>
        <Login setToken={setToken} />
        <Register setToken={setToken} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Collaborative Code Editor</h1>
      <CodeMirror
        value={code}
        height="400px"
        extensions={[javascript({ jsx: true })]}
        onChange={handleChange}
      />
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
