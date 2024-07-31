import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoChat = ({ roomId }) => {
  const socketRef = useRef(null);
  const userVideoRef = useRef(null);
  const peerVideoRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5001");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;
        socketRef.current.emit("join room", roomId);

        socketRef.current.on("other user", (userId) => {
          callUser(userId, stream);
        });

        socketRef.current.on("user joined", (userId) => {
          peerVideoRef.current.srcObject = stream;
        });

        socketRef.current.on("offer", handleReceiveCall);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
      });

    return () => socketRef.current.disconnect();
  }, [roomId]);

  // Implement callUser, handleReceiveCall, handleAnswer, and handleNewICECandidateMsg functions

  return (
    <div>
      <video autoPlay ref={userVideoRef} />
      <video autoPlay ref={peerVideoRef} />
    </div>
  );
};

export default VideoChat;
