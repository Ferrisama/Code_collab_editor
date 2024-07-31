import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import io from "socket.io-client";

const Editor = ({ roomId }) => {
  const editorRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5001");

    editorRef.current = CodeMirror.fromTextArea(
      document.getElementById("realtimeEditor"),
      {
        mode: "javascript",
        theme: "material",
        lineNumbers: true,
      }
    );

    editorRef.current.on("change", (instance, changes) => {
      const { origin } = changes;
      if (origin !== "setValue") {
        socketRef.current.emit("codeChange", {
          roomId,
          code: instance.getValue(),
        });
      }
    });

    socketRef.current.on("codeChange", ({ code }) => {
      editorRef.current.setValue(code);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
